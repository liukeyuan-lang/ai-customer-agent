from contextlib import asynccontextmanager
from datetime import date, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError
from .agent.contract_agent import find_expiring_contracts
from .agent.customer_agent import get_customer_profile, summarize_customer, summarize_customer_data
from .agent.maintenance_agent import find_overdue_maintenance
from .agent.payment_agent import find_unpaid_customers
from .agent.report_agent import generate_report
from .agent.risk_agent import analyze_all, analyze_customer, analyze_customers
from .config import settings
from .dependencies import get_authenticated_client
from .intent_router import route_intent
from .qdrant_client import get_qdrant_client
from .scheduler.daily_check import run_daily_check
from .schemas import ChatRequest, CustomerCreate, CustomerImportRequest, ReportRequest
from .services.customer_service import create_customer, get_customer, list_customers
from .supabase_client import get_service_client


scheduler = BackgroundScheduler(timezone="Asia/Shanghai")
session_memory: dict[str, dict] = {}


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler.add_job(run_daily_check, "cron", hour=8, minute=0, id="daily_customer_check", replace_existing=True)
    scheduler.start()
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="空香 AI 客户经营 Agent API", version="0.1.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.exception_handler(APIError)
async def handle_supabase_error(_: Request, exc: APIError):
    code = getattr(exc, "code", None) or "SUPABASE_ERROR"
    if code == "23505":
        return JSONResponse(status_code=409, content={"detail": getattr(exc, "message", None) or "客户已存在，请移除重复记录后重试。", "code": code})
    if code == "22023":
        return JSONResponse(status_code=422, content={"detail": getattr(exc, "message", None) or "导入数据格式不正确。", "code": code})
    if code in {"PGRST202", "PGRST205"}:
        return JSONResponse(
            status_code=503,
            content={"detail": "数据库迁移尚未完成，请在当前 Supabase 项目执行全部迁移文件后重试。", "code": code},
        )
    return JSONResponse(
        status_code=502,
        content={"detail": "业务数据服务暂时不可用，请稍后重试。", "code": code},
    )


@app.get("/health")
def health():
    try:
        get_service_client().table("customers").select("id").limit(1).execute()
        database = {"status": "ready", "provider": "supabase"}
    except APIError as exc:
        database = {"status": "not_ready", "provider": "supabase", "code": getattr(exc, "code", None) or "SUPABASE_ERROR"}
    except Exception:
        database = {"status": "unreachable", "provider": "supabase"}
    try:
        collections = get_qdrant_client().get_collections().collections
        vector_store = {"status": "ready", "provider": "qdrant", "collection_count": len(collections)}
    except Exception:
        vector_store = {"status": "unreachable", "provider": "qdrant"}
    status = "ok" if database["status"] == "ready" and vector_store["status"] == "ready" else "degraded"
    return {"status": status, "database": database, "vector_store": vector_store}


@app.get("/api/dashboard")
def dashboard(auth=Depends(get_authenticated_client)):
    client, _ = auth
    customers = list_customers(client)
    risks = analyze_customers(customers)
    high = [item for item in risks if item["risk_level"] == "高"]
    return {"customer_count": len(customers), "scanned_count": len(risks), "risk_customer_count": len([x for x in risks if x["risk_level"] != "低"]), "pending_count": len(high), "high_risk_customers": high}


@app.get("/api/customers")
def customers(auth=Depends(get_authenticated_client)):
    items = list_customers(auth[0])
    for item in items:
        if not item.get("customer_risks"):
            item["customer_risks"] = [analyze_customer(item)]
    return items


@app.post("/api/customers")
def add_customer(payload: CustomerCreate, auth=Depends(get_authenticated_client)):
    client, user = auth
    data = payload.model_dump(mode="json", exclude_none=True)
    data["customer_name"] = data["customer_name"].strip()
    if not data["customer_name"]:
        raise HTTPException(status_code=422, detail="客户名称不能为空")
    existing = client.table("customers").select("id").eq("user_id", str(user.id)).eq("customer_name", data["customer_name"]).limit(1).execute().data
    if existing:
        raise HTTPException(status_code=409, detail=f"客户“{data['customer_name']}”已存在")
    return create_customer(client, str(user.id), data)


@app.post("/api/customers/import")
def import_customers(payload: CustomerImportRequest, auth=Depends(get_authenticated_client)):
    if not payload.customers:
        raise HTTPException(status_code=422, detail="导入数据不能为空")
    items = [item.model_dump(mode="json", exclude_none=True) for item in payload.customers]
    return auth[0].rpc("import_customers", {"items": items}).execute().data


@app.get("/api/customers/{customer_id}")
def customer_detail(customer_id: str, auth=Depends(get_authenticated_client)):
    return get_customer(auth[0], customer_id)


@app.get("/api/customers/{customer_id}/summary")
def customer_summary(customer_id: str, auth=Depends(get_authenticated_client)):
    return summarize_customer(auth[0], customer_id)


@app.get("/api/customers/{customer_id}/full")
def customer_full(customer_id: str, auth=Depends(get_authenticated_client)):
    customer = get_customer(auth[0], customer_id)
    return {"customer": customer, "summary": summarize_customer_data(customer, customer_id)}


@app.post("/api/assistant/chat")
def chat(payload: ChatRequest, auth=Depends(get_authenticated_client)):
    client, user = auth
    user_id = str(user.id)
    customers = client.table("customers").select("id,customer_name").order("customer_name").execute().data
    memory = session_memory.setdefault(user_id, {})
    routed = route_intent(payload.message, customers, memory)
    parameters = routed.parameters
    if payload.customer_id:
        match = next((item for item in customers if item["id"] == payload.customer_id), None)
        if match:
            parameters.update({"customer_id": match["id"], "customer_name": match["customer_name"]})
    if parameters.get("customer_id"):
        memory.update({"last_customer_id": parameters["customer_id"], "last_customer": parameters.get("customer_name", "")})

    customer_id = parameters.get("customer_id")
    if routed.intent == "contract_expire":
        answer = find_expiring_contracts(client, customer_id)
    elif routed.intent == "maintenance_check":
        answer = find_overdue_maintenance(client, customer_id)
    elif routed.intent == "payment_check":
        answer = find_unpaid_customers(client, customer_id)
    elif routed.intent == "customer_profile":
        answer = get_customer_profile(client, customer_id) if customer_id else "请告诉我具体客户名称，例如：演示客户 04 怎么样？"
    elif routed.intent == "risk_analysis":
        answer = analyze_all(client)
    elif routed.intent == "business_report":
        end = date.today(); start = end - timedelta(days=90)
        answer = generate_report(client, start.isoformat(), end.isoformat())
    else:
        answer = "我可以查询合同续约、维护逾期、客户欠款、客户画像、风险分析和经营报告。请换一种方式描述问题。"
    return {"type": routed.intent, "intent": routed.intent, "parameters": parameters, "answer": answer, "context": {"last_customer": memory.get("last_customer")}}


@app.post("/api/reports")
def report(payload: ReportRequest, auth=Depends(get_authenticated_client)):
    return generate_report(auth[0], payload.start.isoformat(), payload.end.isoformat())
