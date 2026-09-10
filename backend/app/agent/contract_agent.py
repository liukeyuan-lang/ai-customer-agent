from datetime import date
from .risk_agent import analyze_customer


def find_expiring_contracts(client, customer_id: str | None = None, within_days: int = 60):
    query = client.table("customers").select("id,customer_name,owner,contracts(*),service_records(*),payments(*),next_service_date")
    if customer_id:
        query = query.eq("id", customer_id)
    customers = query.execute().data
    today = date.today()
    results = []
    for customer in customers:
        for contract in customer.get("contracts", []):
            remaining_days = (date.fromisoformat(contract["end_date"]) - today).days
            if remaining_days <= within_days:
                results.append({
                    "customer_id": customer["id"], "customer_name": customer["customer_name"],
                    "start_date": contract["start_date"], "end_date": contract["end_date"],
                    "remaining_days": remaining_days, "amount": float(contract.get("amount", 0)),
                    "owner": customer.get("owner") or "待分配", "service_count": len(customer.get("service_records", [])),
                    "risk_level": analyze_customer(customer)["risk_level"],
                    "suggestion": "合同已到期，请立即联系客户" if remaining_days < 0 else "提前联系客户确认续约计划",
                })
    return sorted(results, key=lambda item: item["remaining_days"])
