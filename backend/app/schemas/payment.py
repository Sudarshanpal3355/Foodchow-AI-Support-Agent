from pydantic import BaseModel, Field


class PaymentResponse(BaseModel):
    payment_id: str
    order_id: str
    customer_id: str

    amount: float = Field(..., ge=0)

    status: str
    method: str
    transaction_id: str


class PaymentLookupRequest(BaseModel):
    order_id: str = Field(..., min_length=1)