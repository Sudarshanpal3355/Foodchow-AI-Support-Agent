from pydantic import BaseModel


class AccountResponse(BaseModel):
    account_id: str
    restaurant_id: str

    email: str
    role: str

    status: str
    security_status: str


class AccountLookupRequest(BaseModel):
    account_id: str