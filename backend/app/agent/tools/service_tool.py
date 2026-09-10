def fetch_services(client, customer_id: str | None = None, start: str | None = None, end: str | None = None):
    query = client.table("service_records").select("*")
    if customer_id:
        query = query.eq("customer_id", customer_id)
    if start:
        query = query.gte("service_date", start)
    if end:
        query = query.lte("service_date", end)
    return query.execute().data
