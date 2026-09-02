from backend.app.agent.state import AgentState


def analyze_root_cause(state: AgentState) -> AgentState:
    """
    Determine the likely root cause using available
    tool results and customer intent.

    Only information returned by tools is used.
    """

    intent = state.get("intent")
    tool_results = state.get("tool_results", [])

    if not tool_results:
        state["root_cause"] = (
            "Root cause cannot be determined because "
            "no tool evidence is available."
        )
        return state

    root_cause = None

    for result in tool_results:

        if not result.get("success"):
            continue

        data = result.get("data", {})

        # -------------------------------------------------
        # Order issue
        # -------------------------------------------------

        if intent == "order_issue":

            order_status = data.get("status")
            payment_status = data.get("payment_status")

            if (
                order_status == "pending"
                and payment_status == "paid"
            ):
                root_cause = (
                    "The order is currently pending even though "
                    "the payment has been completed."
                )

            elif order_status:
                root_cause = (
                    f"The order is currently in "
                    f"'{order_status}' status."
                )

        # -------------------------------------------------
        # Payment issue
        # -------------------------------------------------

        elif intent == "payment_issue":

            payment_status = data.get("status")

            if payment_status == "success":
                root_cause = (
                    "The payment was successfully processed."
                )

            elif payment_status:
                root_cause = (
                    f"The payment is currently in "
                    f"'{payment_status}' status."
                )

    if root_cause is None:
        root_cause = (
            "The available tool information is insufficient "
            "to determine the root cause."
        )

    state["root_cause"] = root_cause

    return state