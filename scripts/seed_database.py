import json
from pathlib import Path

from backend.app.core.config import settings
from backend.app.database.collections import COLLECTIONS
from backend.app.database.mongodb import mongodb


# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

MOCK_DATA_DIR = BASE_DIR / "mock_data"


FILE_COLLECTION_MAP = {
    "restaurants.json": COLLECTIONS["restaurants"],
    "outlets.json": COLLECTIONS["outlets"],
    "customers.json": COLLECTIONS["customers"],
    "orders.json": COLLECTIONS["orders"],
    "payments.json": COLLECTIONS["payments"],
    "printers.json": COLLECTIONS["printers"],
    "kds.json": COLLECTIONS["kds"],
    "menus.json": COLLECTIONS["menus"],
    "accounts.json": COLLECTIONS["accounts"],
    "tickets.json": COLLECTIONS["tickets"],
}


def load_json_file(file_path: Path) -> list:
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def seed_collection(database, collection_name: str, documents: list) -> None:
    collection = database[collection_name]

    if not documents:
        print(f"Skipping {collection_name}: no documents found.")
        return

    collection.delete_many({})

    result = collection.insert_many(documents)

    print(
        f"{collection_name}: "
        f"inserted {len(result.inserted_ids)} documents."
    )


def main() -> None:

    if not settings.MONGODB_URI:
        print("ERROR: MONGODB_URI is not configured.")
        return

    if mongodb.database is None:
        print("Connecting to MongoDB...")

        from backend.app.database.mongodb import connect_to_mongodb

        connect_to_mongodb()

    if mongodb.database is None:
        print("ERROR: MongoDB database connection failed.")
        return

    print()
    print("==========================================")
    print(" FoodChow Mock Database Seeder")
    print("==========================================")
    print()

    print(f"Database: {settings.MONGODB_DATABASE}")
    print(f"Mock data directory: {MOCK_DATA_DIR}")
    print()

    for filename, collection_name in FILE_COLLECTION_MAP.items():

        file_path = MOCK_DATA_DIR / filename

        if not file_path.exists():
            print(f"WARNING: {filename} not found.")
            continue

        documents = load_json_file(file_path)

        seed_collection(
            mongodb.database,
            collection_name,
            documents
        )

    print()
    print("==========================================")
    print(" Database seeding completed successfully.")
    print("==========================================")


if __name__ == "__main__":
    main()