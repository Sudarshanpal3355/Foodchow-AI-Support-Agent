from backend.app.database.mongodb import mongodb


def get_order(order_id: str):
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    order = mongodb.database["orders"].find_one(
        {"order_id": order_id},
        {"_id": 0}
    )

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