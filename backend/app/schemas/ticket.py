from datetime import datetime

from pydantic import BaseModel, Field


class TicketCreateRequest(BaseModel):
    conversation_id: str
    issue: str = Field(..., min_length=1)
    priority: str = "medium"


class TicketResponse(BaseModel):
    ticket_id: str
    conversation_id: str

    issue: str
    priority: str

    status: str

    restaurant_id: str | None = None
    outlet_id: str | None = None
    order_id: str | None = None

    created_at: datetime