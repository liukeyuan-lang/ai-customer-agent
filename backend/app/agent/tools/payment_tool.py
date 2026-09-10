def fetch_payments(client, customer_id: str | None = None):
    query = client.table("payments").select("*")
    if customer_id:
        query = query.eq("customer_id", customer_id)
    return query.execute().data
