from datetime import date


def find_overdue_maintenance(client, customer_id: str | None = None):
    query = client.table("customers").select("id,customer_name,owner,next_service_date,equipment(*),service_records(*)")
    if customer_id:
        query = query.eq("id", customer_id)
    customers = query.execute().data
    today = date.today()
    results = []
    for customer in customers:
        due_date = customer.get("next_service_date")
        if not due_date:
            continue
        overdue_days = (today - date.fromisoformat(due_date)).days
        if overdue_days <= 0:
            continue
        records = sorted(customer.get("service_records", []), key=lambda item: item["service_date"], reverse=True)
        devices = [item.get("device_model") or item.get("device_name") for item in customer.get("equipment", [])]
        results.append({
            "customer_id": customer["id"], "customer_name": customer["customer_name"],
            "devices": devices, "last_service_date": records[0]["service_date"] if records else None,
            "due_date": due_date, "overdue_days": overdue_days, "owner": customer.get("owner") or "待分配",
        })
    return sorted(results, key=lambda item: item["overdue_days"], reverse=True)
