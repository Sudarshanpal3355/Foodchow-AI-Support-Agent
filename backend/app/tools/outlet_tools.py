from backend.app.database.mongodb import mongodb


def lookup_outlet(outlet_id: str) -> dict:
    """
    Look up FoodChow outlet information using the outlet ID.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    outlet = mongodb.database["outlets"].find_one(
        {"outlet_id": outlet_id},
        {"_id": 0},
    )

    if outlet is None:
        return {
            "success": False,
            "error": f"No outlet record found for {outlet_id}.",
        }

    return {
        "success": True,
        "data": outlet,
    }