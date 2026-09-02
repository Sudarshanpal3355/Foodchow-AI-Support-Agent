from pydantic import BaseModel, Field


class CustomerResponse(BaseModel):
    customer_id: str
    name: str
    email: str
    phone: str
    status: str


class CustomerLookupRequest(BaseModel):
    customer_id: str = Field(..., min_length=1)