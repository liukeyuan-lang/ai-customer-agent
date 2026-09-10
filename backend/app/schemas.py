from datetime import date
from pydantic import BaseModel


class CustomerCreate(BaseModel):
    customer_name: str
    industry: str = ""
    address: str = ""
    contact_name: str = ""
    phone: str = ""
    owner: str = ""
    status: str = "normal"
    first_cooperation_date: date | None = None
    next_service_date: date | None = None
    health_score: int = 100


class CustomerImportRequest(BaseModel):
    customers: list[CustomerCreate]


class ChatRequest(BaseModel):
    message: str
    customer_id: str | None = None


class ReportRequest(BaseModel):
    start: date
    end: date
