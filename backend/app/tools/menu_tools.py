from backend.app.database.mongodb import mongodb


def lookup_menu(menu_id: str) -> dict:
    """
    Look up menu information using a menu ID.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    menu = mongodb.database["menus"].find_one(
        {"menu_id": menu_id},
        {"_id": 0},
    )

    if menu is None:
        return {
            "success": False,
            "error": f"No menu record found for {menu_id}.",
        }

    return {
        "success": True,
        "data": menu,
    }


def lookup_outlet_menu(outlet_id: str) -> dict:
    """
    Look up the menu associated with an outlet.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    menu = mongodb.database["menus"].find_one(
        {"outlet_id": outlet_id},
        {"_id": 0},
    )

    if menu is None:
        return {
            "success": False,
            "error": f"No menu found for outlet {outlet_id}.",
        }

    return {
        "success": True,
        "data": menu,
    }