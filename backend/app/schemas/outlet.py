from pydantic import BaseModel, Field


class OutletResponse(BaseModel):
    outlet_id: str
    restaurant_id: str
    name: str
    address: str
    status: str


class OutletLookupRequest(BaseModel):
    outlet_id: str = Field(..., min_length=1)