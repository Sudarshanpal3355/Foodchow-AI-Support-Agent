from backend.app.database.collections import COLLECTIONS
from backend.app.database.mongodb import connect_to_mongodb, mongodb


def main():
    connect_to_mongodb()

    if mongodb.database is None:
        print("MongoDB connection failed.")
        return

    print()
    print("==========================================")
    print(" FoodChow Database Verification")
    print("==========================================")
    print()

    for collection_name in COLLECTIONS.values():
        count = mongodb.database[collection_name].count_documents({})
        print(f"{collection_name:<20} {count} documents")

    print()
    print("==========================================")
    print(" Verification completed.")
    print("==========================================")


if __name__ == "__main__":
    main()