import json
from pathlib import Path

from pymongo.errors import PyMongoError

from backend.app.database.mongodb import mongodb


MOCK_ORDERS_PATH = (
    Path(__file__).resolve().parents[3]
    / "mock_data"
    / "orders.json"
)


def _get_mock_order(order_id: str):
    if not MOCK_ORDERS_PATH.exists():
        return None

    orders = json.loads(
        MOCK_ORDERS_PATH.read_text(encoding="utf-8")
    )

    return next(
        (
            order
            for order in orders
            if order.get("order_id") == order_id
        ),
        None,
    )


def get_order(order_id: str):
    if mongodb.database is None:
        return _get_mock_order(order_id)

    try:
        order = mongodb.database["orders"].find_one(
            {"order_id": order_id},
            {"_id": 0}
        )
    except PyMongoError:
        order = _get_mock_order(order_id)

    return order


def get_customer_orders(customer_id: str):
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    return list(
        mongodb.database["orders"].find(
            {"customer_id": customer_id},
            {"_id": 0}
        )
    )


def get_outlet_orders(outlet_id: str):
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    return list(
        mongodb.database["orders"].find(
            {"outlet_id": outlet_id},
            {"_id": 0}
        )
    )


def get_order_status(order_id: str):
    order = get_order(order_id)

    if order is None:
        return None

    return {
        "order_id": order["order_id"],
        "status": order["status"],
        "payment_status": order["payment_status"]
    }