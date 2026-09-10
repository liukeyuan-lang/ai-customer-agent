def find_unpaid_customers(client, customer_id: str | None = None):
    query = client.table("customers").select("id,customer_name,owner,payments(*)")
    if customer_id:
        query = query.eq("id", customer_id)
    customers = query.execute().data
    results = []
    for customer in customers:
        for payment in customer.get("payments", []):
            unpaid = float(payment.get("unpaid_amount", 0))
            if unpaid <= 0:
                continue
            results.append({
                "customer_id": customer["id"], "customer_name": customer["customer_name"],
                "total_amount": float(payment.get("total_amount", 0)), "paid_amount": float(payment.get("paid_amount", 0)),
                "unpaid_amount": unpaid, "payment_method": payment.get("payment_method") or "未记录",
                "owner": customer.get("owner") or "待分配",
            })
    return sorted(results, key=lambda item: item["unpaid_amount"], reverse=True)
