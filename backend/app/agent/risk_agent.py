from datetime import date, timedelta


def analyze_customer(customer: dict) -> dict:
    today = date.today()
    score, reasons, suggestions = 0, [], []
    contracts = customer.get("contracts", [])
    services = customer.get("service_records", [])
    payments = customer.get("payments", [])
    if contracts:
        end = date.fromisoformat(contracts[0]["end_date"])
        days = (end - today).days
        if days <= 60:
            score += 40
            reasons.append("合同已到期" if days < 0 else f"合同将在 {days} 天后到期")
            suggestions.append("提前联系客户推进续约")
    next_service = customer.get("next_service_date")
    if next_service and date.fromisoformat(next_service) < today:
        score += 35
        reasons.append("已超过计划维护日期")
        suggestions.append("尽快安排工程师上门维护")
    unpaid = sum(float(item.get("unpaid_amount", 0)) for item in payments)
    if unpaid > 0:
        score += 25
        reasons.append(f"存在欠款 ¥{unpaid:,.0f}")
        suggestions.append("跟进回款计划")
    level = "高" if score >= 65 else "中" if score >= 30 else "低"
    return {"risk_level": level, "risk_score": min(score, 100), "reason": reasons or ["暂无明显风险"], "suggestion": suggestions or ["保持正常服务节奏"]}


def analyze_customers(customers: list[dict]):
    return [{"customer_id": item["id"], "customer_name": item["customer_name"], **analyze_customer(item)} for item in customers]


def analyze_all(client):
    customers = client.table("customers").select("*,contracts(*),service_records(*),payments(*)").execute().data
    return analyze_customers(customers)
