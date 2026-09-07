import json
from pathlib import Path

from pymongo.errors import PyMongoError

from backend.app.database.mongodb import mongodb


MOCK_ACCOUNTS_PATH = (
    Path(__file__).resolve().parents[3]
    / "mock_data"
    / "accounts.json"
)


def _get_mock_account(account_id: str):
    if not MOCK_ACCOUNTS_PATH.exists():
        return None

    accounts = json.loads(
        MOCK_ACCOUNTS_PATH.read_text(encoding="utf-8")
    )

    return next(
        (
            account
            for account in accounts
            if account.get("account_id") == account_id
        ),
        None,
    )


def lookup_account(account_id: str) -> dict:
    """
    Look up FoodChow account information using the account ID.
    """

    if mongodb.database is None:
        account = _get_mock_account(account_id)
        if account is None:
            return {
                "success": False,
                "error": f"No account record found for {account_id}.",
            }
        return {"success": True, "data": account}

    try:
        account = mongodb.database["accounts"].find_one(
            {"account_id": account_id},
            {"_id": 0},
        )
    except PyMongoError:
        account = _get_mock_account(account_id)

    if account is None:
        return {
            "success": False,
            "error": f"No account record found for {account_id}.",
        }

    return {
        "success": True,
        "data": account,
    }


def lookup_restaurant_account(restaurant_id: str) -> dict:
    """
    Look up the account associated with a restaurant.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    account = mongodb.database["accounts"].find_one(
        {"restaurant_id": restaurant_id},
        {"_id": 0},
    )

    if account is None:
        return {
            "success": False,
            "error": (
                f"No account found for restaurant "
                f"{restaurant_id}."
            ),
        }

    return {
        "success": True,
        "data": account,
    }