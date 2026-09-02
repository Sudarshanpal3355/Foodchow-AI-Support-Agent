from typing import Any

from backend.app.agent.tool_runner import execute_tool


def escalate_to_human(
    issue: str,
    priority: str = "medium",
    customer_id: str | None = None,
    order_id: str | None = None,
    restaurant_id: str | None = None,
    outlet_id: str | None = None,
) -> dict[str, Any]:
    """
    Create a support ticket for issues that require human assistance.
    """

    result = execute_tool(
        "create_ticket",
        {
            "issue": issue,
            "priority": priority,
            "customer_id": customer_id,
            "order_id": order_id,
            "restaurant_id": restaurant_id,
            "outlet_id": outlet_id,
        },
    )

    import json

    return json.loads(result)