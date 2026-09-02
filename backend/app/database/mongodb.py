from pymongo import MongoClient

from backend.app.core.config import settings
from backend.app.database.indexes import create_indexes


class MongoDB:
    client: MongoClient | None = None
    database = None


mongodb = MongoDB()


def connect_to_mongodb() -> None:
    if not settings.MONGODB_URI:
        print("MongoDB URI not configured. Running without database connection.")
        return

    mongodb.client = MongoClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=5000,
    )

    mongodb.client.admin.command("ping")

    mongodb.database = mongodb.client[settings.MONGODB_DATABASE]

    create_indexes(mongodb.database)

    print("MongoDB connected successfully.")


def close_mongodb_connection() -> None:
    if mongodb.client is not None:
        mongodb.client.close()
        mongodb.client = None
        mongodb.database = None

        print("MongoDB connection closed.")