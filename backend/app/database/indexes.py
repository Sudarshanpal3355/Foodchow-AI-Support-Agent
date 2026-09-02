from backend.app.database.collections import COLLECTIONS


def create_indexes(database):

    database[COLLECTIONS["restaurants"]].create_index(
        "restaurant_id",
        unique=True
    )

    database[COLLECTIONS["outlets"]].create_index(
        "outlet_id",
        unique=True
    )

    database[COLLECTIONS["outlets"]].create_index(
        "restaurant_id"
    )

    database[COLLECTIONS["customers"]].create_index(
        "customer_id",
        unique=True
    )

    database[COLLECTIONS["orders"]].create_index(
        "order_id",
        unique=True
    )

    database[COLLECTIONS["orders"]].create_index(
        "customer_id"
    )

    database[COLLECTIONS["orders"]].create_index(
        "restaurant_id"
    )

    database[COLLECTIONS["orders"]].create_index(
        "outlet_id"
    )

    database[COLLECTIONS["payments"]].create_index(
        "payment_id",
        unique=True
    )

    database[COLLECTIONS["payments"]].create_index(
        "order_id"
    )

    database[COLLECTIONS["printers"]].create_index(
        "printer_id",
        unique=True
    )

    database[COLLECTIONS["printers"]].create_index(
        "outlet_id"
    )

    database[COLLECTIONS["kds"]].create_index(
        "kds_id",
        unique=True
    )

    database[COLLECTIONS["kds"]].create_index(
        "outlet_id"
    )

    database[COLLECTIONS["menus"]].create_index(
        "menu_id",
        unique=True
    )

    database[COLLECTIONS["menus"]].create_index(
        "restaurant_id"
    )

    database[COLLECTIONS["menus"]].create_index(
        "outlet_id"
    )

    database[COLLECTIONS["accounts"]].create_index(
        "account_id",
        unique=True
    )

    database[COLLECTIONS["accounts"]].create_index(
        "restaurant_id"
    )

    database[COLLECTIONS["conversations"]].create_index(
        "conversation_id",
        unique=True
    )

    database[COLLECTIONS["tickets"]].create_index(
        "ticket_id",
        unique=True
    )

    print("MongoDB indexes created successfully.")