from dataclasses import dataclass, field


@dataclass
class IntentResult:
    intent: str
    parameters: dict = field(default_factory=dict)

    def model_dump(self) -> dict:
        return {"intent": self.intent, "parameters": self.parameters}


INTENT_KEYWORDS = {
    "contract_expire": ("合同", "续约", "到期", "快到期", "什么时候续", "需要续"),
    "maintenance_check": ("维护", "保养", "服务", "上门", "多久没维护", "逾期"),
    "payment_check": ("欠款", "未付款", "付款", "回款", "收款", "没收"),
    "risk_analysis": ("风险", "危险", "异常"),
    "business_report": ("报告", "经营分析", "经营数据", "数据分析"),
    "customer_profile": ("介绍一下", "查看", "查询", "情况", "怎么样", "客户画像"),
}


def route_intent(message: str, customers: list[dict], memory: dict | None = None) -> IntentResult:
    text = message.strip()
    parameters: dict = {}
    matched_customer = next((item for item in customers if item["customer_name"] in text), None)
    if matched_customer:
        parameters = {"customer_id": matched_customer["id"], "customer_name": matched_customer["customer_name"]}

    if matched_customer and ("总结" in text or any(word in text for word in INTENT_KEYWORDS["customer_profile"])):
        return IntentResult("customer_profile", parameters)

    for intent in ("contract_expire", "maintenance_check", "payment_check", "risk_analysis", "business_report", "customer_profile"):
        if any(word in text for word in INTENT_KEYWORDS[intent]):
            if intent in {"contract_expire", "maintenance_check", "payment_check", "customer_profile"} and not parameters and memory:
                if memory.get("last_customer_id"):
                    parameters = {
                        "customer_id": memory["last_customer_id"],
                        "customer_name": memory.get("last_customer", ""),
                        "from_context": True,
                    }
            return IntentResult(intent, parameters)

    if matched_customer:
        return IntentResult("customer_profile", parameters)
    if "总结" in text or "数据" in text:
        return IntentResult("business_report", parameters)
    return IntentResult("unknown", parameters)
