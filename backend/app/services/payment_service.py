from backend.app.database.mongodb import mongodb


def get_payment_by_order(order_id: str):
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    payment = mongodb.database["payments"].find_one(
        {"order_id": order_id},
        {"_id": 0}
    )

    return payment


def get_payment_status(order_id: str):
    payment = get_payment_by_order(order_id)

    if payment is None:
        return None

    return {
        "payment_id": payment["payment_id"],
        "order_id": payment["order_id"],
        "amount": payment["amount"],
        "status": payment["status"],
        "method": payment["method"],
        "transaction_id": payment["transaction_id"]
    }