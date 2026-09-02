from backend.app.database.mongodb import mongodb


def lookup_restaurant(restaurant_id: str) -> dict:
    """
    Look up restaurant information using the restaurant ID.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    restaurant = mongodb.database["restaurants"].find_one(
        {"restaurant_id": restaurant_id},
        {"_id": 0},
    )

    if restaurant is None:
        return {
            "success": False,
            "error": (
                f"No restaurant record found "
                f"for {restaurant_id}."
            ),
        }

    return {
        "success": True,
        "data": restaurant,
    }