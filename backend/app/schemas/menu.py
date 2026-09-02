from pydantic import BaseModel, Field


class MenuResponse(BaseModel):
    menu_id: str
    restaurant_id: str
    outlet_id: str

    name: str
    status: str

    version: int = Field(..., ge=1)

    last_updated: str


class MenuStatusResponse(BaseModel):
    menu_id: str
    status: str
    version: int
    last_updated: str