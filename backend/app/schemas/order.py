from datetime import datetime

from pydantic import BaseModel, Field


class OrderItem(BaseModel):
    item_id: str
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., ge=0)


class OrderResponse(BaseModel):
    order_id: str
    restaurant_id: str
    outlet_id: str
    customer_id: str

    items: list[OrderItem]

    total_amount: float = Field(..., ge=0)

    status: str
    payment_status: str

    created_at: datetime


class OrderLookupRequest(BaseModel):
    order_id: str = Field(..., min_length=1)