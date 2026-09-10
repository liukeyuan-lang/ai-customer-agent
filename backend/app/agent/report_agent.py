from .risk_agent import analyze_customer


def generate_report(client, start: str, end: str):
    customers = client.table("customers").select("id,contracts(*),service_records(*),payments(*)").execute().data
    services = client.table("service_records").select("id").gte("service_date", start).lte("service_date", end).execute().data
    contracts = client.table("contracts").select("amount").gte("start_date", start).lte("start_date", end).execute().data
    payments = client.table("payments").select("paid_amount").gte("payment_date", start).lte("payment_date", end).execute().data
    risk_count = sum(1 for item in customers if analyze_customer(item)["risk_level"] != "低")
    return {"period": {"start": start, "end": end}, "customer_count": len(customers), "service_count": len(services), "contract_count": len(contracts), "contract_amount": sum(float(x["amount"]) for x in contracts), "payment_amount": sum(float(x["paid_amount"]) for x in payments), "risk_customer_count": risk_count, "ai_suggestion": "优先跟进高风险客户续约、逾期维护和欠款回收。"}
