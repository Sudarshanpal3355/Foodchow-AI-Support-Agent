from backend.app.agent.intent import normalize_order_id
from backend.app.services.order_service import get_order


# =========================================================
# LOOKUP ORDER
# =========================================================

def lookup_order(order_id: str) -> dict:
    """
    Look up an order from the FoodChow database.

    Supports both customer-facing formats:

        ORD1001
        ORD-1001

    Both are normalized to:

        ORD1001
    """

    # -----------------------------------------------------
    # Validate and normalize Order ID
    # -----------------------------------------------------

    normalized_order_id = normalize_order_id(
        order_id
    )

    if not normalized_order_id:

        return {
            "success": False,
            "error": "A valid Order ID is required.",
        }

    # -----------------------------------------------------
    # Database lookup
    # -----------------------------------------------------

    try:

        order = get_order(
            normalized_order_id
        )

    except RuntimeError as exc:

        return {
            "success": False,
            "error": str(exc),
        }

    except Exception as exc:

        return {
            "success": False,
            "error": (
                "Unable to retrieve the order "
                f"at this time: {exc}"
            ),
        }

    # -----------------------------------------------------
    # Order not found
    # -----------------------------------------------------

    if order is None:

        return {
            "success": False,
            "error": (
                f"Order {normalized_order_id} "
                "was not found."
            ),
        }

    # -----------------------------------------------------
    # Success
    # -----------------------------------------------------

    return {
        "success": True,
        "order": order,
    }