from pydantic import BaseModel, Field


class RestaurantResponse(BaseModel):
    restaurant_id: str
    name: str
    status: str
    cuisine: str
    city: str


class RestaurantLookupRequest(BaseModel):
    restaurant_id: str = Field(..., min_length=1)