from backend.app.database.mongodb import mongodb


def lookup_printer(printer_id: str) -> dict:
    """
    Look up printer information using the printer ID.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    printer = mongodb.database["printers"].find_one(
        {"printer_id": printer_id},
        {"_id": 0},
    )

    if printer is None:
        return {
            "success": False,
            "error": f"No printer record found for {printer_id}.",
        }

    return {
        "success": True,
        "data": printer,
    }


def lookup_outlet_printer(outlet_id: str) -> dict:
    """
    Look up the printer associated with an outlet.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    printer = mongodb.database["printers"].find_one(
        {"outlet_id": outlet_id},
        {"_id": 0},
    )

    if printer is None:
        return {
            "success": False,
            "error": f"No printer found for outlet {outlet_id}.",
        }

    return {
        "success": True,
        "data": printer,
    }