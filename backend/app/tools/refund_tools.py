from backend.app.database.mongodb import mongodb


def lookup_refund(order_id: str) -> dict:
    """
    Look up refund information for a FoodChow order.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    refund = mongodb.database["refunds"].find_one(
        {"order_id": order_id},
        {"_id": 0},
    )

    if refund is None:
        return {
            "success": False,
            "error": f"No refund record found for order {order_id}.",
        }

    return {
        "success": True,
        "data": refund,
    }