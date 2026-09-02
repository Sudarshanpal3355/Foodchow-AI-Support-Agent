from pydantic import BaseModel


class KDSResponse(BaseModel):
    kds_id: str
    outlet_id: str
    name: str

    status: str
    connection_status: str

    pending_orders: int
    last_order_received: str | None = None


class KDSStatusResponse(BaseModel):
    kds_id: str
    status: str
    connection_status: str

    pending_orders: int
    last_order_received: str | None = None