from backend.app.database.mongodb import mongodb


def lookup_payment(order_id: str) -> dict:
    """
    Look up payment information for a FoodChow order.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    payment = mongodb.database["payments"].find_one(
        {"order_id": order_id},
        {"_id": 0},
    )

    if payment is None:
        return {
            "success": False,
            "error": f"No payment record found for order {order_id}.",
        }

    return {
        "success": True,
        "data": payment,
    }