from fastapi import HTTPException


CUSTOMER_DETAIL_SELECT = "*,equipment(*),contracts(*),service_records(*),payments(*),customer_risks(*)"


def list_customers(client):
    result = client.table("customers").select("*,equipment(quantity),contracts(*),service_records(service_date),payments(*),customer_risks(risk_level,risk_score)").order("customer_name").execute()
    return result.data


def get_customer(client, customer_id: str):
    result = client.table("customers").select(CUSTOMER_DETAIL_SELECT).eq("id", customer_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="客户不存在")
    return result.data


def create_customer(client, user_id: str, payload: dict):
    payload["user_id"] = user_id
    return client.table("customers").insert(payload).execute().data[0]
