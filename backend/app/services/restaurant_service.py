from backend.app.database.mongodb import mongodb


def get_restaurant(restaurant_id: str):
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    restaurant = mongodb.database["restaurants"].find_one(
        {"restaurant_id": restaurant_id},
        {"_id": 0}
    )

    return restaurant


def get_outlet(outlet_id: str):
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    outlet = mongodb.database["outlets"].find_one(
        {"outlet_id": outlet_id},
        {"_id": 0}
    )

    return outlet


def get_all_restaurants():
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    return list(
        mongodb.database["restaurants"].find(
            {},
            {"_id": 0}
        )
    )


def get_all_outlets():
    if mongodb.database is None:
        raise RuntimeError("Database is not connected.")

    return list(
        mongodb.database["outlets"].find(
            {},
            {"_id": 0}
        )
    )