from datetime import datetime
from ..agent.risk_agent import analyze_all
from ..supabase_client import get_service_client


def run_daily_check():
    client = get_service_client()
    results = analyze_all(client)
    for item in results:
        if item["risk_level"] == "低":
            continue
        payload = {"customer_id": item["customer_id"], "risk_level": item["risk_level"], "risk_score": item["risk_score"], "risk_reason": "；".join(item["reason"]), "suggestion": "；".join(item["suggestion"])}
        customer = client.table("customers").select("user_id").eq("id", item["customer_id"]).single().execute().data
        payload["user_id"] = customer["user_id"]
        client.table("customer_risks").insert(payload).execute()
        client.table("notifications").insert({"user_id": customer["user_id"], "customer_id": item["customer_id"], "type": "risk", "content": f'{item["customer_name"]}：{payload["risk_reason"]}', "status": "pending"}).execute()
    return {"checked_at": datetime.now().isoformat(), "customer_count": len(results)}
