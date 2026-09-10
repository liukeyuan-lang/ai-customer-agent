from datetime import date
from .risk_agent import analyze_customer
from .tools.customer_tool import fetch_customer


def summarize_customer(client, customer_id: str):
    customer = fetch_customer(client, customer_id)
    return summarize_customer_data(customer, customer_id)


def summarize_customer_data(customer: dict, customer_id: str | None = None):
    customer_id = customer_id or customer["id"]
    equipment_count = sum(item.get("quantity", 0) for item in customer.get("equipment", []))
    service_count = len(customer.get("service_records", []))
    years = max(1, (date.today() - date.fromisoformat(customer["first_cooperation_date"])).days // 365)
    risk = analyze_customer(customer)
    return {"customer_id": customer_id, "summary": f"该客户合作约 {years} 年，拥有 {equipment_count} 台设备，累计记录服务 {service_count} 次。", "risk": risk, "suggestion": "；".join(risk["suggestion"])}


def get_customer_profile(client, customer_id: str):
    customer = fetch_customer(client, customer_id)
    summary = summarize_customer_data(customer, customer_id)
    contracts = customer.get("contracts", [])
    payments = customer.get("payments", [])
    return {
        "customer_id": customer_id,
        "customer_name": customer["customer_name"],
        "industry": customer.get("industry"),
        "contact_name": customer.get("contact_name"),
        "phone": customer.get("phone"),
        "owner": customer.get("owner"),
        "address": customer.get("address"),
        "equipment_count": sum(item.get("quantity", 0) for item in customer.get("equipment", [])),
        "contract": contracts[0] if contracts else None,
        "service_count": len(customer.get("service_records", [])),
        "latest_service_date": max((item["service_date"] for item in customer.get("service_records", [])), default=None),
        "total_amount": sum(float(item.get("total_amount", 0)) for item in payments),
        "paid_amount": sum(float(item.get("paid_amount", 0)) for item in payments),
        "unpaid_amount": sum(float(item.get("unpaid_amount", 0)) for item in payments),
        "risk": summary["risk"],
        "summary": summary["summary"],
        "suggestion": summary["suggestion"],
    }
