from ...services.customer_service import get_customer, list_customers


def fetch_customer(client, customer_id: str):
    return get_customer(client, customer_id)


def fetch_customers(client):
    return list_customers(client)
