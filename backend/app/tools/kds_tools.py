from backend.app.database.mongodb import mongodb


def lookup_kds(kds_id: str) -> dict:
    """
    Look up KDS information using the KDS ID.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    kds = mongodb.database["kds"].find_one(
        {"kds_id": kds_id},
        {"_id": 0},
    )

    if kds is None:
        return {
            "success": False,
            "error": f"No KDS record found for {kds_id}.",
        }

    return {
        "success": True,
        "data": kds,
    }


def lookup_outlet_kds(outlet_id: str) -> dict:
    """
    Look up the KDS associated with an outlet.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    kds = mongodb.database["kds"].find_one(
        {"outlet_id": outlet_id},
        {"_id": 0},
    )

    if kds is None:
        return {
            "success": False,
            "error": f"No KDS found for outlet {outlet_id}.",
        }

    return {
        "success": True,
        "data": kds,
    }