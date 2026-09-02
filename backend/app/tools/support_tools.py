from datetime import datetime, timezone
from uuid import uuid4

from backend.app.database.mongodb import mongodb


def lookup_ticket(ticket_id: str) -> dict:
    """
    Look up a FoodChow support ticket using the ticket ID.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    ticket = mongodb.database["tickets"].find_one(
        {"ticket_id": ticket_id},
        {"_id": 0},
    )

    if ticket is None:
        return {
            "success": False,
            "error": f"No ticket record found for {ticket_id}.",
        }

    return {
        "success": True,
        "data": ticket,
    }


def create_ticket(
    issue: str,
    priority: str = "medium",
    customer_id: str | None = None,
    order_id: str | None = None,
    restaurant_id: str | None = None,
    outlet_id: str | None = None,
) -> dict:
    """
    Create a new FoodChow support ticket.
    """

    if mongodb.database is None:
        return {
            "success": False,
            "error": "Database connection is not available.",
        }

    if not issue or not issue.strip():
        return {
            "success": False,
            "error": "Issue description is required.",
        }

    allowed_priorities = {"low", "medium", "high"}

    if priority not in allowed_priorities:
        return {
            "success": False,
            "error": (
                "Invalid priority. "
                "Use low, medium, or high."
            ),
        }

    ticket_id = f"TKT-{uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()

    ticket = {
        "ticket_id": ticket_id,
        "customer_id": customer_id,
        "order_id": order_id,
        "issue": issue.strip(),
        "priority": priority,
        "status": "open",
        "created_at": now,
        "updated_at": now,
    }

    if restaurant_id is not None:
        ticket["restaurant_id"] = restaurant_id

    if outlet_id is not None:
        ticket["outlet_id"] = outlet_id

    mongodb.database["tickets"].insert_one(ticket)

    ticket.pop("_id", None)

    return {
        "success": True,
        "data": ticket,
    }