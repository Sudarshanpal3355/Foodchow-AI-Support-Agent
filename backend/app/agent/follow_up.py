from backend.app.agent.state import AgentState


def handle_follow_up(
    state: AgentState,
) -> AgentState:
    """
    Determine whether the customer needs to provide
    additional information before an operational lookup
    can be performed.

    If a required identifier is missing:

        1. Store the missing information.
        2. Create a safe customer-facing follow-up response.
        3. Prevent human escalation.
        4. Stop the operational workflow in the orchestrator.

    No operational tool should run when a required identifier
    is missing.
    """

    entities = state.get(
        "entities",
        {},
    )

    intent = state.get(
        "intent"
    )

    # =========================================================
    # RESET FOLLOW-UP INFORMATION
    # =========================================================

    state["missing_information"] = []

    state["response"] = None

    missing_information: list[str] = []

    # =========================================================
    # ORDER
    # =========================================================

    if (
        intent == "order_issue"
        and not entities.get("order_id")
    ):

        missing_information.append(
            "Order ID"
        )

    # =========================================================
    # PAYMENT
    # =========================================================

    elif (
        intent == "payment_issue"
        and not entities.get("order_id")
    ):

        missing_information.append(
            "Order ID"
        )

    # =========================================================
    # REFUND
    # =========================================================

    elif (
        intent == "refund_issue"
        and not entities.get("order_id")
    ):

        missing_information.append(
            "Order ID"
        )

    # =========================================================
    # MENU
    # =========================================================

    elif (
        intent == "menu_issue"
        and not entities.get("menu_id")
        and not entities.get("outlet_id")
    ):

        missing_information.append(
            "Outlet ID or Menu ID"
        )

    # =========================================================
    # PRINTER
    # =========================================================

    elif (
        intent == "printer_issue"
        and not entities.get("printer_id")
        and not entities.get("outlet_id")
    ):

        missing_information.append(
            "Printer ID or Outlet ID"
        )

    # =========================================================
    # KDS
    # =========================================================

    elif (
        intent == "kds_issue"
        and not entities.get("kds_id")
        and not entities.get("outlet_id")
    ):

        missing_information.append(
            "KDS ID or Outlet ID"
        )

    # =========================================================
    # ACCOUNT
    # =========================================================

    elif (
        intent == "account_issue"
        and not entities.get("account_id")
        and not entities.get("restaurant_id")
    ):

        missing_information.append(
            "Account ID or Restaurant ID"
        )

    # =========================================================
    # OUTLET
    # =========================================================

    elif (
        intent == "outlet_issue"
        and not entities.get("outlet_id")
    ):

        missing_information.append(
            "Outlet ID"
        )

    # =========================================================
    # RESTAURANT
    # =========================================================

    elif (
        intent == "restaurant_issue"
        and not entities.get("restaurant_id")
    ):

        missing_information.append(
            "Restaurant ID"
        )

    # =========================================================
    # HANDLE MISSING INFORMATION
    # =========================================================

    if missing_information:

        state["missing_information"] = (
            missing_information
        )

        # -----------------------------------------------------
        # A missing identifier is NOT a human escalation.
        # -----------------------------------------------------

        state["requires_escalation"] = False

        # -----------------------------------------------------
        # Create a direct follow-up response.
        #
        # This tells the orchestrator to stop before:
        #
        #     tools
        #     RAG
        #     escalation
        #     reasoning
        #     confidence
        #     final generation
        # -----------------------------------------------------

        if intent in {
            "order_issue",
            "payment_issue",
            "refund_issue",
        }:

            state["response"] = (
                "Please provide your Order ID so I can "
                "check the details of your request."
            )

        elif intent == "menu_issue":

            state["response"] = (
                "Please provide your Outlet ID or Menu ID "
                "so I can check the menu details."
            )

        elif intent == "printer_issue":

            state["response"] = (
                "Please provide your Printer ID or Outlet ID "
                "so I can check the printer status."
            )

        elif intent == "kds_issue":

            state["response"] = (
                "Please provide your KDS ID or Outlet ID "
                "so I can check the KDS status."
            )

        elif intent == "account_issue":

            state["response"] = (
                "Please provide your Account ID or Restaurant ID "
                "so I can check the account details."
            )

        elif intent == "outlet_issue":

            state["response"] = (
                "Please provide your Outlet ID "
                "so I can check the outlet details."
            )

        elif intent == "restaurant_issue":

            state["response"] = (
                "Please provide your Restaurant ID "
                "so I can check the restaurant details."
            )

        return state

    # =========================================================
    # ALL REQUIRED INFORMATION AVAILABLE
    # =========================================================

    state["missing_information"] = []

    state["response"] = None

    return state