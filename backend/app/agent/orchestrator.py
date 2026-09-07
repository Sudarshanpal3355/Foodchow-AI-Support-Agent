import json

from backend.app.agent.confidence import evaluate_confidence
from backend.app.agent.escalation import escalate_to_human
from backend.app.agent.follow_up import handle_follow_up
from backend.app.agent.nodes import analyze_message
from backend.app.agent.reasoning import analyze_reasoning
from backend.app.agent.response import generate_agent_response
from backend.app.agent.root_cause import analyze_root_cause
from backend.app.agent.state import AgentState
from backend.app.agent.tool_runner import execute_tool

from backend.app.database.mongodb import (
    mongodb,
)
from backend.app.core.config import settings

# ============================================================
# ACTIVITY
# ============================================================

def _record_activity(
    state: AgentState,
    step: str,
    name: str,
    status: str = "success",
    details: dict | None = None,
):
    activity = state.setdefault("activity", [])

    event = {
        "step": step,
        "name": name,
        "status": status,
    }

    if details:
        event["details"] = details

    activity.append(event)


def _fast_chat_response(intent: str | None, entities: dict) -> str:
    responses = {
        "payment_issue": "I can help check the payment. Please provide your Order ID, such as ORD-1001.",
        "refund_issue": "I can help check the refund. Please provide your Order ID, such as ORD-1001.",
        "order_issue": "Please provide your Order ID, such as ORD-1001, so I can check the order.",
        "printer_issue": "I can help troubleshoot the printer. Please provide the Printer ID or Outlet ID.",
        "kds_issue": "I can help troubleshoot the KDS. Please provide the KDS ID or Outlet ID.",
        "menu_issue": "I can help with the menu. Please provide the Menu ID or Outlet ID.",
        "restaurant_issue": "I can help check the restaurant. Please provide the Restaurant ID.",
        "outlet_issue": "I can help check the outlet. Please provide the Outlet ID.",
        "account_issue": "I can help check the account. Please provide the Account ID or Restaurant ID.",
        "general_support": "I can help with orders, payments, refunds, menus, printers, KDS, restaurants, outlets, and accounts. What do you need checked?",
    }
    return responses.get(
        intent,
        "I can help with your FoodChow support request. Please provide a little more detail.",
    )


# ============================================================
# TOOL EXECUTION
# ============================================================

def _execute_and_record_tool(
    state: AgentState,
    tool_name: str,
    arguments: dict,
) -> dict:

    _record_activity(
        state,
        step="tool_execution",
        name=tool_name,
        status="running",
        details={
            "arguments": arguments,
        },
    )

    try:
        result = execute_tool(
            tool_name,
            arguments,
        )

    except Exception as exc:

        parsed_result = {
            "success": False,
            "error": str(exc),
        }

        state.setdefault(
            "tool_results",
            [],
        ).append(parsed_result)

        if tool_name not in state.setdefault(
            "tools_used",
            [],
        ):
            state["tools_used"].append(
                tool_name
            )

        if state.get("activity"):
            state["activity"][-1]["status"] = "failed"

        return parsed_result

    # --------------------------------------------------------
    # Normalize result
    # --------------------------------------------------------

    try:

        if isinstance(result, str):

            parsed_result = json.loads(result)

        elif isinstance(result, dict):

            parsed_result = result

        else:

            parsed_result = {
                "success": False,
                "error": "Invalid tool response type.",
            }

    except (
        json.JSONDecodeError,
        TypeError,
    ):

        parsed_result = {
            "success": False,
            "error": "Invalid tool response.",
        }

    if not isinstance(
        parsed_result,
        dict,
    ):

        parsed_result = {
            "success": False,
            "error": "Invalid tool response format.",
        }

    # --------------------------------------------------------
    # Save result
    # --------------------------------------------------------

    state.setdefault(
        "tool_results",
        [],
    ).append(parsed_result)

    # --------------------------------------------------------
    # Save tool name
    # --------------------------------------------------------

    if tool_name not in state.setdefault(
        "tools_used",
        [],
    ):

        state["tools_used"].append(
            tool_name
        )

    # --------------------------------------------------------
    # Activity result
    # --------------------------------------------------------

    if state.get("activity"):

        state["activity"][-1]["status"] = (
            "success"
            if parsed_result.get("success") is True
            else "failed"
        )

    return parsed_result


# ============================================================
# SUCCESSFUL TOOL DATA
# ============================================================

def _get_successful_data(
    tool_results: list,
) -> list[dict]:
    """
    Supports:

        {"success": True, "data": {...}}

    and:

        {"success": True, "order": {...}}

    and equivalent entity-specific structures.
    """

    successful_data = []

    entity_keys = (
        "order",
        "payment",
        "refund",
        "restaurant",
        "outlet",
        "menu",
        "printer",
        "kds",
        "account",
        "ticket",
    )

    for result in tool_results:

        if not isinstance(
            result,
            dict,
        ):
            continue

        if result.get(
            "success"
        ) is not True:
            continue

        # ----------------------------------------------------
        # Standard data structure
        # ----------------------------------------------------

        data = result.get(
            "data"
        )

        if isinstance(
            data,
            dict,
        ):

            successful_data.append(
                data
            )

            continue

        # ----------------------------------------------------
        # Entity-specific structure
        # ----------------------------------------------------

        for key in entity_keys:

            candidate = result.get(
                key
            )

            if isinstance(
                candidate,
                dict,
            ):

                successful_data.append(
                    candidate
                )

                break

    return successful_data


# ============================================================
# FIND ORDER
# ============================================================

def _find_order_data(
    tool_results: list,
) -> dict | None:

    for data in _get_successful_data(
        tool_results
    ):

        # Do not mistake payment records for orders.
        if data.get(
            "payment_id"
        ):
            continue

        if data.get(
            "order_id"
        ):

            return data

    return None


# ============================================================
# FIND PAYMENT
# ============================================================

def _find_payment_data(
    tool_results: list,
) -> dict | None:

    for data in _get_successful_data(
        tool_results
    ):

        if data.get(
            "payment_id"
        ):

            return data

    return None


# ============================================================
# FIND REFUND
# ============================================================

def _find_refund_data(
    tool_results: list,
) -> dict | None:

    for data in _get_successful_data(
        tool_results
    ):

        if (
            data.get("refund_id")
            or
            data.get("refund_status")
        ):

            return data

    return None


# ============================================================
# FIND MENU
# ============================================================

def _find_menu_data(
    tool_results: list,
) -> dict | None:
    """
    Return the first successfully retrieved menu record.
    """

    for data in _get_successful_data(
        tool_results
    ):

        if data.get(
            "menu_id"
        ):

            return data

    return None


# ============================================================
# TOOL FAILURE
# ============================================================

def _has_tool_failure(
    tool_results: list,
) -> bool:

    for result in tool_results:

        if not isinstance(
            result,
            dict,
        ):
            continue

        if result.get(
            "success"
        ) is False:

            return True

    return False


# ============================================================
# CUSTOMER MESSAGE
# ============================================================

def _get_customer_message(
    user_message: str,
    conversation_context: str,
) -> str:
    """
    Return the CURRENT customer message.

    Conversation context is supporting information only.
    It must never replace the current customer message.

    This prevents an old request such as:

        "What is the menu for OUT001?"

    from replacing a new request such as:

        "What is the menu for OUT004?"
    """

    message = (
        user_message or ""
    ).strip()

    return message


# ============================================================
# COMBINED CUSTOMER TEXT
# ============================================================

def _get_combined_customer_text(
    user_message: str,
    conversation_context: str,
) -> str:

    message = (
        user_message or ""
    ).strip()

    context = (
        conversation_context or ""
    ).strip()

    if message and context:

        return (
            f"{message} {context}"
        )

    return context or message


# ============================================================
# NORMAL ORDER CHECK
# ============================================================

def _is_normal_confirmed_paid_order(
    tool_results: list,
) -> bool:

    order_data = _find_order_data(
        tool_results
    )

    if not order_data:
        return False

    status = str(
        order_data.get(
            "status",
            "",
        )
    ).strip().lower()

    payment_status = str(
        order_data.get(
            "payment_status",
            "",
        )
    ).strip().lower()

    return (
        status == "confirmed"
        and
        payment_status == "paid"
    )


# ============================================================
# EXACT VERIFIED ORDER
# ============================================================

def _find_verified_order(
    tool_results: list,
    requested_order_id: str | None,
) -> dict | None:
    """
    Returns an order ONLY when:

    1. The tool explicitly succeeded.
    2. The response contains an order object.
    3. The returned order ID exactly matches the requested ID.
    """

    if not requested_order_id:
        return None

    normalized_requested_id = (
        str(requested_order_id)
        .strip()
        .upper()
        .replace("-", "")
    )

    for result in tool_results:

        if not isinstance(
            result,
            dict,
        ):
            continue

        if result.get(
            "success"
        ) is not True:
            continue

        order = result.get(
            "order"
        )

        if not isinstance(
            order,
            dict,
        ):
            continue

        returned_order_id = (
            str(
                order.get(
                    "order_id",
                    "",
                )
            )
            .strip()
            .upper()
            .replace("-", "")
        )

        if (
            returned_order_id
            == normalized_requested_id
        ):

            return order

    return None


# ============================================================
# EXACT VERIFIED MENU
# ============================================================

def _find_verified_menu(
    tool_results: list,
    requested_menu_id: str | None = None,
    requested_outlet_id: str | None = None,
) -> dict | None:
    """
    Return a verified MongoDB menu record only.

    A valid menu record MUST contain menu_id.  This deliberately ignores
    escalation/ticket records, payment records, order records, etc.

    If a Menu ID was requested, it must match exactly.
    If an Outlet ID was requested, both menu_id and outlet_id must exist
    and the outlet_id must match exactly.
    """

    normalized_menu_id = (
        str(requested_menu_id).strip().upper()
        if requested_menu_id
        else None
    )
    normalized_outlet_id = (
        str(requested_outlet_id).strip().upper()
        if requested_outlet_id
        else None
    )

    for result in tool_results:
        if not isinstance(result, dict):
            continue

        if result.get("success") is not True:
            continue

        # Accept the normal tool shape: {"success": True, "data": {...}}
        data = result.get("data")

        # Also tolerate {"success": True, "menu": {...}}
        if not isinstance(data, dict):
            data = result.get("menu")

        if not isinstance(data, dict):
            continue

        # CRITICAL: a menu MUST have a real menu_id.
        # This prevents a ticket such as {"status": "open"}
        # from being interpreted as a menu.
        returned_menu_id = str(data.get("menu_id", "")).strip().upper()
        if not returned_menu_id:
            continue

        returned_outlet_id = str(
            data.get("outlet_id", "")
        ).strip().upper()

        # If Menu ID was explicitly requested, require an exact match.
        if normalized_menu_id:
            if returned_menu_id != normalized_menu_id:
                continue

            # If both identifiers were supplied, verify both.
            if (
                normalized_outlet_id
                and returned_outlet_id != normalized_outlet_id
            ):
                continue

            return data

        # If Outlet ID was explicitly requested, require an exact outlet
        # match. Never return a menu belonging to another outlet.
        if normalized_outlet_id:
            if returned_outlet_id != normalized_outlet_id:
                continue

            return data

    return None


# ============================================================
# MAIN SUPPORT AGENT
# ============================================================

def run_support_agent(
    user_message: str,
    conversation_context: str = "",
) -> AgentState:

    # ========================================================
    # MESSAGE
    # ========================================================

    customer_message = _get_customer_message(
        user_message,
        conversation_context,
    )

    combined_customer_text = _get_combined_customer_text(
        user_message,
        conversation_context,
    )

    # ========================================================
    # INITIAL STATE
    # ========================================================

    state: AgentState = {

        "user_message":
            user_message,

        "conversation_id":
            None,

        "customer_id":
            None,

        "conversation_context":
            conversation_context,

        "intent":
            None,

        "entities":
            {},

        "tool_results":
            [],

        "tools_used":
            [],

        "reasoning":
            None,

        "root_cause":
            None,

        "context_type":
            None,

        "confidence":
            None,

        "requires_escalation":
            False,

        "response":
            None,

        "messages":
            [],

        "activity":
            [],

        "rag_used":
            False,

        "rag_documents":
            [],

        "rag_citations":
            [],

        "rag_formatted_citations":
            [],
    }

    # ========================================================
    # 1. ANALYZE MESSAGE
    # ========================================================

    state = analyze_message(
        state
    )

    _record_activity(
        state,
        step="analysis",
        name="analyze_message",
        status="success",
        details={
            "intent":
                state.get("intent"),
        },
    )

    # ========================================================
    # 2. FOLLOW-UP
    # ========================================================

    state = handle_follow_up(
        state
    )

    _record_activity(
        state,
        step="analysis",
        name="handle_follow_up",
        status="success",
    )

    # ========================================================
    # STOP IF FOLLOW-UP RESPONSE
    # ========================================================

    if state.get(
        "response"
    ):

        _record_activity(
            state,
            step="response",
            name="follow_up_response",
            status="success",
        )

        return state

    # ========================================================
    # VARIABLES
    # ========================================================

    intent = state.get(
        "intent"
    )

    entities = state.get(
        "entities",
        {},
    )

    if settings.FAST_CHAT_MODE and intent not in {
        "order_issue",
        "account_issue",
    }:
        state["response"] = _fast_chat_response(intent, entities)
        state["requires_escalation"] = False
        state["ticket_id"] = None
        _record_activity(
            state,
            step="response",
            name="fast_chat_response",
            status="success",
        )
        return state

    # ========================================================
    # 3. OPERATIONAL TOOLS
    # ========================================================

    # --------------------------------------------------------
    # ORDER
    # --------------------------------------------------------

    if intent == "order_issue":

        order_id = entities.get(
            "order_id"
        )

        if order_id:

            _execute_and_record_tool(
                state,
                "lookup_order",
                {
                    "order_id":
                        order_id,
                },
            )

    # --------------------------------------------------------
    # PAYMENT
    # --------------------------------------------------------

    elif intent == "payment_issue":

        order_id = entities.get(
            "order_id"
        )

        if order_id:

            _execute_and_record_tool(
                state,
                "lookup_payment",
                {
                    "order_id":
                        order_id,
                },
            )

            # Payment-related order problems should always
            # verify the current order status as well.
            #
            # This is important for cases such as:
            #
            #   "Payment was deducted but my order is still pending"
            #
            # The payment result alone is not sufficient to
            # diagnose the issue.
            _execute_and_record_tool(
                state,
                "lookup_order",
                {
                    "order_id":
                        order_id,
                },
            )

    # --------------------------------------------------------
    # REFUND
    # --------------------------------------------------------

    elif intent == "refund_issue":

        order_id = entities.get(
            "order_id"
        )

        if order_id:

            _execute_and_record_tool(
                state,
                "lookup_refund",
                {
                    "order_id":
                        order_id,
                },
            )

    # --------------------------------------------------------
    # RESTAURANT
    # --------------------------------------------------------

    elif intent == "restaurant_issue":

        restaurant_id = entities.get(
            "restaurant_id"
        )

        if restaurant_id:

            _execute_and_record_tool(
                state,
                "lookup_restaurant",
                {
                    "restaurant_id":
                        restaurant_id,
                },
            )

    # --------------------------------------------------------
    # OUTLET
    # --------------------------------------------------------

    elif intent == "outlet_issue":

        outlet_id = entities.get(
            "outlet_id"
        )

        if outlet_id:

            _execute_and_record_tool(
                state,
                "lookup_outlet",
                {
                    "outlet_id":
                        outlet_id,
                },
            )

    # --------------------------------------------------------
    # MENU
    # --------------------------------------------------------

    elif intent == "menu_issue":

        menu_id = entities.get(
            "menu_id"
        )

        outlet_id = entities.get(
            "outlet_id"
        )

        # ----------------------------------------------------
        # Specific Menu ID
        # ----------------------------------------------------

        if menu_id:

            _execute_and_record_tool(
                state,
                "lookup_menu",
                {
                    "menu_id":
                        menu_id,
                },
            )

        # ----------------------------------------------------
        # Specific Outlet ID
        # ----------------------------------------------------

        elif outlet_id:

            _execute_and_record_tool(
                state,
                "lookup_outlet_menu",
                {
                    "outlet_id":
                        outlet_id,
                },
            )

    # --------------------------------------------------------
    # PRINTER
    # --------------------------------------------------------

    elif intent == "printer_issue":

        printer_id = entities.get(
            "printer_id"
        )

        outlet_id = entities.get(
            "outlet_id"
        )

        if printer_id:

            _execute_and_record_tool(
                state,
                "lookup_printer",
                {
                    "printer_id":
                        printer_id,
                },
            )

        elif outlet_id:

            _execute_and_record_tool(
                state,
                "lookup_outlet_printer",
                {
                    "outlet_id":
                        outlet_id,
                },
            )

    # --------------------------------------------------------
    # KDS
    # --------------------------------------------------------

    elif intent == "kds_issue":

        kds_id = entities.get(
            "kds_id"
        )

        outlet_id = entities.get(
            "outlet_id"
        )

        if kds_id:

            _execute_and_record_tool(
                state,
                "lookup_kds",
                {
                    "kds_id":
                        kds_id,
                },
            )

        elif outlet_id:

            _execute_and_record_tool(
                state,
                "lookup_outlet_kds",
                {
                    "outlet_id":
                        outlet_id,
                },
            )

    # --------------------------------------------------------
    # ACCOUNT
    # --------------------------------------------------------

    elif intent == "account_issue":

        account_id = entities.get(
            "account_id"
        )

        restaurant_id = entities.get(
            "restaurant_id"
        )

        if account_id:

            _execute_and_record_tool(
                state,
                "lookup_account",
                {
                    "account_id":
                        account_id,
                },
            )

        elif restaurant_id:

            _execute_and_record_tool(
                state,
                "lookup_restaurant_account",
                {
                    "restaurant_id":
                        restaurant_id,
                },
            )

    # --------------------------------------------------------
    # GENERAL SUPPORT / TICKET
    # --------------------------------------------------------

    elif intent == "general_support":

        ticket_id = entities.get(
            "ticket_id"
        )

        if ticket_id:

            _execute_and_record_tool(
                state,
                "lookup_ticket",
                {
                    "ticket_id":
                        ticket_id,
                },
            )

    # ========================================================
    # 4. RAG
    # ========================================================

    _record_activity(
        state,
        step="rag",
        name="retrieve_knowledge",
        status="running",
    )

    try:

        rag_query = customer_message

        if conversation_context:

            rag_query = (
                f"Conversation context: "
                f"{conversation_context}\n"
                f"Current customer message: "
                f"{customer_message}"
            )

        if intent:

            rag_query += (
                f"\nSupport intent: {intent}"
            )

        if entities:

            entity_parts = []

            for key, value in entities.items():

                if value:

                    entity_parts.append(
                        f"{key}: {value}"
                    )

            if entity_parts:

                rag_query += (
                    "\nRelevant identifiers: "
                    +
                    ", ".join(
                        entity_parts
                    )
                )

        if settings.FAST_CHAT_MODE or intent == "order_issue":
            rag_result = {
                "success": True,
                "documents": [],
                "citations": [],
                "formatted_citations": [],
            }
        else:
            from backend.app.rag.pipeline import run_rag

            rag_result = run_rag(
                query=rag_query,
                retrieval_top_k=5,
                rerank_top_k=3,
            )

    except Exception as exc:

        rag_result = {
            "success": False,
            "documents": [],
            "citations": [],
            "formatted_citations": [],
            "error": str(exc),
        }

    if rag_result.get(
        "success"
    ):

        documents = rag_result.get(
            "documents",
            [],
        )

        citations = rag_result.get(
            "citations",
            [],
        )

        formatted_citations = rag_result.get(
            "formatted_citations",
            [],
        )

        state[
            "rag_documents"
        ] = documents

        state[
            "rag_citations"
        ] = citations

        state[
            "rag_formatted_citations"
        ] = formatted_citations

        state[
            "rag_used"
        ] = bool(documents)

        if state.get("activity"):

            state["activity"][-1]["status"] = "success"

            state["activity"][-1]["details"] = {
                "used":
                    bool(documents),

                "documents":
                    len(documents),

                "citations":
                    len(citations),
            }

    else:

        state[
            "rag_used"
        ] = False

        state[
            "rag_documents"
        ] = []

        state[
            "rag_citations"
        ] = []

        state[
            "rag_formatted_citations"
        ] = []

        if state.get("activity"):

            state["activity"][-1]["status"] = "failed"

            state["activity"][-1]["details"] = {
                "used": False,
                "documents": 0,
                "citations": 0,
            }

    # ========================================================
    # 5. ESCALATION
    # ========================================================

    tool_results = state.get(
        "tool_results",
        [],
    )

    should_escalate = False
    escalation_priority = "medium"

    # ========================================================
    # EXPLICIT HUMAN SUPPORT REQUEST
    # ========================================================
    #
    # A direct request for a human agent must create a
    # support ticket even when the intent classifier labels
    # the message as general_support.
    # ========================================================

    normalized_message = customer_message.lower()

    human_support_phrases = [
        "human support",
        "human agent",
        "real person",
        "talk to a human",
        "speak to a human",
        "connect me to a human",
        "connect me with a human",
        "talk to an agent",
        "speak to an agent",
        "connect me to an agent",
        "connect me with an agent",
        "support agent",
        "customer support",
        "need human",
        "need an agent",
        "need a human",
        "still not resolved",
        "issue is still not resolved",
        "not resolved",
        "not fixed",
        "still having the issue",
    ]

    if (
        intent == "general_support"
        and any(
            phrase in normalized_message
            for phrase in human_support_phrases
        )
    ):
        should_escalate = True
        escalation_priority = "high"

    # ========================================================
    # ORDER ESCALATION
    # ========================================================

    if intent == "order_issue":

        order_data = _find_order_data(
            tool_results
        )

        # ----------------------------------------------------
        # ORDER NOT FOUND
        # ----------------------------------------------------

        if not order_data:

            if entities.get(
                "order_id"
            ):

                should_escalate = True
                escalation_priority = "high"

        else:

            order_status = str(
                order_data.get(
                    "status",
                    "",
                )
            ).strip().lower()

            payment_status = str(
                order_data.get(
                    "payment_status",
                    "",
                )
            ).strip().lower()

            message = (
                combined_customer_text.lower()
            )

            # ------------------------------------------------
            # NORMAL CONFIRMED + PAID
            # ------------------------------------------------

            if (
                order_status == "confirmed"
                and
                payment_status == "paid"
            ):

                should_escalate = False
                escalation_priority = "medium"

            # ------------------------------------------------
            # PAYMENT CONFLICT
            # ------------------------------------------------

            elif (
                order_status == "pending"
                and
                payment_status == "paid"
            ):

                payment_words = [
                    "paid",
                    "payment",
                    "charged",
                    "money deducted",
                    "money was deducted",
                    "already paid",
                ]

                if any(
                    word in message
                    for word in payment_words
                ):

                    should_escalate = True
                    escalation_priority = "high"

            # ------------------------------------------------
            # FAILED
            # ------------------------------------------------

            elif order_status == "failed":

                failure_words = [
                    "failed",
                    "failure",
                    "problem",
                    "issue",
                    "error",
                    "not working",
                ]

                if any(
                    word in message
                    for word in failure_words
                ):

                    should_escalate = True
                    escalation_priority = "high"

            # ------------------------------------------------
            # CANCELLED
            # ------------------------------------------------

            elif order_status in {
                "cancelled",
                "canceled",
            }:

                cancellation_words = [
                    "cancelled",
                    "canceled",
                    "cancel",
                ]

                if any(
                    word in message
                    for word in cancellation_words
                ):

                    should_escalate = True
                    escalation_priority = "high"

            # ------------------------------------------------
            # DELAYED
            # ------------------------------------------------

            elif order_status == "delayed":

                delay_words = [
                    "delayed",
                    "late",
                    "not arrived",
                    "not delivered",
                    "where is my order",
                ]

                if any(
                    word in message
                    for word in delay_words
                ):

                    should_escalate = True
                    escalation_priority = "medium"

    # ========================================================
    # OTHER TOOL FAILURE
    # ========================================================

    elif _has_tool_failure(
        tool_results
    ):

        should_escalate = True
        escalation_priority = "high"

    # ========================================================
    # PRINTER
    # ========================================================

    if intent == "printer_issue":

        for data in _get_successful_data(
            tool_results
        ):

            status = str(
                data.get(
                    "status",
                    "",
                )
            ).lower()

            connection_status = str(
                data.get(
                    "connection_status",
                    "",
                )
            ).lower()

            if (
                status == "offline"
                or
                connection_status == "disconnected"
            ):

                should_escalate = True
                escalation_priority = "high"

    # ========================================================
    # KDS
    # ========================================================

    if intent == "kds_issue":

        for data in _get_successful_data(
            tool_results
        ):

            status = str(
                data.get(
                    "status",
                    "",
                )
            ).lower()

            connection_status = str(
                data.get(
                    "connection_status",
                    "",
                )
            ).lower()

            if (
                status == "offline"
                or
                connection_status == "disconnected"
            ):

                should_escalate = True
                escalation_priority = "high"

    # ========================================================
    # ACCOUNT
    # ========================================================

    if intent == "account_issue":

        for data in _get_successful_data(
            tool_results
        ):

            status = str(
                data.get(
                    "status",
                    "",
                )
            ).lower()

            security_status = str(
                data.get(
                    "security_status",
                    "",
                )
            ).lower()

            if (
                status == "locked"
                or
                security_status == "requires_verification"
            ):

                should_escalate = True
                escalation_priority = "high"

    # ========================================================
    # REFUND
    # ========================================================

    if intent == "refund_issue":

        refund_data = _find_refund_data(
            tool_results
        )

        if refund_data:

            refund_status = str(
                refund_data.get(
                    "refund_status",
                    refund_data.get(
                        "status",
                        "",
                    ),
                )
            ).lower()

            if refund_status in {
                "failed",
                "declined",
                "error",
            }:

                should_escalate = True
                escalation_priority = "high"

    # ========================================================
    # PAYMENT
    # ========================================================

    if intent == "payment_issue":

        payment_data = _find_payment_data(
            tool_results
        )

        order_data = _find_order_data(
            tool_results
        )

        if payment_data:

            payment_status = str(
                payment_data.get(
                    "status",
                    "",
                )
            ).lower()

            if payment_status in {
                "failed",
                "declined",
            }:

                should_escalate = True
                escalation_priority = "high"

        if (
            payment_data
            and
            order_data
            and
            str(
                payment_data.get(
                    "status",
                    "",
                )
            ).lower()
            == "success"
            and
            str(
                order_data.get(
                    "status",
                    "",
                )
            ).lower()
            == "pending"
        ):

            should_escalate = True
            escalation_priority = "high"

    # ========================================================
    # MENU
    # ========================================================

    if intent == "menu_issue":

        menu_id = entities.get(
            "menu_id"
        )

        outlet_id = entities.get(
            "outlet_id"
        )

        verified_menu = _find_verified_menu(
            tool_results,
            requested_menu_id=menu_id,
            requested_outlet_id=outlet_id,
        )

        # ----------------------------------------------------
        # Requested identifier exists but no matching menu
        # ----------------------------------------------------

        if (
            menu_id
            or outlet_id
        ):

            if verified_menu is None:

                should_escalate = True
                escalation_priority = "high"

    # ========================================================
    # FINAL ORDER ESCALATION OVERRIDE
    # ========================================================

    if intent == "order_issue":

        requested_order_id = entities.get(
            "order_id"
        )

        verified_order = _find_verified_order(
            tool_results,
            requested_order_id,
        )

        # ----------------------------------------------------
        # No verified order
        # ----------------------------------------------------

        if (
            requested_order_id
            and
            verified_order is None
        ):

            should_escalate = True
            escalation_priority = "high"

        # ----------------------------------------------------
        # Verified normal order
        # ----------------------------------------------------

        elif verified_order:

            final_status = str(
                verified_order.get(
                    "status",
                    "",
                )
            ).strip().lower()

            final_payment_status = str(
                verified_order.get(
                    "payment_status",
                    "",
                )
            ).strip().lower()

            if (
                final_status == "confirmed"
                and
                final_payment_status == "paid"
            ):

                should_escalate = False
                escalation_priority = "medium"

    # ========================================================
    # RECORD ESCALATION DECISION
    # ========================================================

    _record_activity(
        state,
        step="escalation",
        name="evaluate_escalation",
        status="success",
        details={
            "required":
                should_escalate,

            "priority":
                escalation_priority,
        },
    )

    # ========================================================
    # HUMAN ESCALATION
    # ========================================================

    if should_escalate:

        _record_activity(
            state,
            step="escalation",
            name="escalate_to_human",
            status="running",
            details={
                "priority":
                    escalation_priority,
            },
        )

        escalation = escalate_to_human(
            issue=customer_message,

            priority=
                escalation_priority,

            customer_id=
                state.get(
                    "customer_id"
                ),

            order_id=
                entities.get(
                    "order_id"
                ),

            restaurant_id=
                entities.get(
                    "restaurant_id"
                ),

            outlet_id=
                entities.get(
                    "outlet_id"
                ),
        )

        state[
            "tool_results"
        ].append(
            escalation
        )

        state[
            "requires_escalation"
        ] = True

        ticket_id = None

        if isinstance(
            escalation,
            dict,
        ):

            escalation_data = (
                escalation.get(
                    "data",
                    {},
                )
            )

            if isinstance(
                escalation_data,
                dict,
            ):

                ticket_id = (
                    escalation_data.get(
                        "ticket_id"
                    )
                )

        state[
            "ticket_id"
        ] = ticket_id

        if state.get("activity"):

            state["activity"][-1]["status"] = (
                "success"
                if (
                    isinstance(
                        escalation,
                        dict,
                    )
                    and
                    escalation.get(
                        "success"
                    ) is True
                )
                else "failed"
            )

            state["activity"][-1]["details"] = {
                "priority":
                    escalation_priority,

                "ticket_id":
                    ticket_id,
            }

    else:

        state[
            "requires_escalation"
        ] = False

        state[
            "ticket_id"
        ] = None

    # ========================================================
    # 6. REASONING
    # ========================================================

    state = analyze_reasoning(
        state
    )

    _record_activity(
        state,
        step="analysis",
        name="analyze_reasoning",
        status="success",
    )

    # ========================================================
    # 7. ROOT CAUSE
    # ========================================================

    state = analyze_root_cause(
        state
    )

    _record_activity(
        state,
        step="analysis",
        name="analyze_root_cause",
        status="success",
    )

    # ========================================================
    # 8. CONFIDENCE
    # ========================================================

    state = evaluate_confidence(
        state
    )

    _record_activity(
        state,
        step="analysis",
        name="evaluate_confidence",
        status="success",
        details={
            "confidence":
                state.get(
                    "confidence"
                ),
        },
    )

    # ========================================================
    # NORMAL ORDER PROTECTION BEFORE RESPONSE
    # ========================================================

    if (
        intent == "order_issue"
        and
        _is_normal_confirmed_paid_order(
            state.get(
                "tool_results",
                [],
            )
        )
    ):

        state[
            "requires_escalation"
        ] = False

        state[
            "ticket_id"
        ] = None

    # ========================================================
    # 9. RESPONSE
    # ========================================================

    state = generate_agent_response(
        state
    )

    _record_activity(
        state,
        step="response",
        name="generate_agent_response",
        status="success",
    )

    # ========================================================
    # FINAL ESCALATION / PAYMENT RESPONSE SAFETY
    # ========================================================
    #
    # Always expose a created support ticket to the customer.
    # For payment complaints, include both verified payment
    # status and verified order status.
    # ========================================================

    response_text = str(
        state.get("response") or ""
    )

    ticket_id = state.get("ticket_id")

    if (
        state.get("requires_escalation")
        and ticket_id
        and ticket_id not in response_text
    ):
        response_text = (
            response_text.rstrip()
            + f" Your support ticket is **{ticket_id}**."
        )

    if intent == "payment_issue":

        payment_data = _find_payment_data(
            state.get(
                "tool_results",
                [],
            )
        )

        order_data = _find_order_data(
            state.get(
                "tool_results",
                [],
            )
        )

        if payment_data and order_data:

            payment_status = str(
                payment_data.get(
                    "status",
                    "",
                )
            ).strip().lower()

            order_status = str(
                order_data.get(
                    "status",
                    "",
                )
            ).strip().lower()

            payment_issue_message = any(
                phrase in customer_message.lower()
                for phrase in [
                    "pending",
                    "order is pending",
                    "order still pending",
                    "not confirmed",
                    "not received",
                    "money deducted",
                    "money was deducted",
                    "payment deducted",
                    "paid but",
                ]
            )

            if payment_issue_message:

                order_id = order_data.get(
                    "order_id",
                    entities.get(
                        "order_id",
                        "the order",
                    ),
                )

                if (
                    payment_status
                    in {
                        "success",
                        "successful",
                        "paid",
                    }
                    and order_status == "pending"
                ):
                    response_text = (
                        f"Your payment for order "
                        f"**{order_id}** was successfully "
                        f"processed, but the order is still "
                        f"**pending**. This payment/order status "
                        f"mismatch requires further investigation."
                    )

                elif (
                    payment_status
                    in {
                        "success",
                        "successful",
                        "paid",
                    }
                    and order_status
                    not in {
                        "",
                        "unknown",
                    }
                ):
                    response_text = (
                        f"Your payment for order "
                        f"**{order_id}** was successfully "
                        f"processed, and the current order "
                        f"status is **{order_status}**. "
                        f"I've checked the latest available "
                        f"information for both the payment and "
                        f"order."
                    )

                elif payment_status in {
                    "failed",
                    "declined",
                    "failure",
                }:
                    response_text = (
                        f"The payment for order "
                        f"**{order_id}** is currently "
                        f"**{payment_status}**. Our support team "
                        f"can investigate the payment issue."
                    )

                if (
                    state.get("requires_escalation")
                    and ticket_id
                    and ticket_id not in response_text
                ):
                    response_text = (
                        response_text.rstrip()
                        + f" Your support ticket is "
                        f"**{ticket_id}**."
                    )

    state["response"] = response_text

    # ========================================================
    # FINAL FACTUAL ORDER SAFETY CHECK
    # ========================================================

    if intent == "order_issue":

        requested_order_id = entities.get(
            "order_id"
        )

        if requested_order_id:

            verified_order = _find_verified_order(
                state.get(
                    "tool_results",
                    [],
                ),
                requested_order_id,
            )

            normalized_order_id = (
                str(
                    requested_order_id
                )
                .strip()
                .upper()
                .replace("-", "")
            )

            # ------------------------------------------------
            # ORDER NOT FOUND
            # ------------------------------------------------

            if verified_order is None:

                ticket_id = state.get(
                    "ticket_id"
                )

                if ticket_id:

                    state[
                        "response"
                    ] = (
                        f"I couldn't find order "
                        f"**{normalized_order_id}** "
                        f"in our system. I've created "
                        f"support ticket **{ticket_id}** "
                        f"so our team can help verify it."
                    )

                else:

                    state[
                        "response"
                    ] = (
                        f"I couldn't find order "
                        f"**{normalized_order_id}** "
                        f"in our system. Please verify "
                        f"the Order ID and try again."
                    )

                state[
                    "requires_escalation"
                ] = True

            # ------------------------------------------------
            # VERIFIED ORDER
            # ------------------------------------------------

            else:

                context_type = state.get(
                    "context_type"
                )

                # ------------------------------------------------
                # DELIVERY-DELAY FOLLOW-UP
                # ------------------------------------------------
                # response.py already performs deterministic
                # delivery-delay response generation. Do not
                # overwrite that contextual answer with the
                # generic order-status response.
                # ------------------------------------------------

                if context_type == "delivery_delay":
                    pass

                # ------------------------------------------------
                # NORMAL ORDER REQUEST
                # ------------------------------------------------

                else:

                    order_id = verified_order.get(
                        "order_id",
                        normalized_order_id,
                    )

                    status = verified_order.get(
                        "status",
                        "unknown",
                    )

                    payment_status = verified_order.get(
                        "payment_status",
                        "unknown",
                    )

                    total_amount = verified_order.get(
                        "total_amount"
                    )

                    response_text = (
                        f"Your order **{order_id}** "
                        f"is currently **{status}** "
                        f"and the payment status is "
                        f"**{payment_status}**."
                    )

                    if total_amount is not None:

                        response_text += (
                            f" The total amount is "
                            f"**{total_amount}**."
                        )

                    # ------------------------------------------------
                    # Pending + paid
                    # ------------------------------------------------

                    if (
                        str(status)
                        .strip()
                        .lower()
                        == "pending"
                        and
                        str(payment_status)
                        .strip()
                        .lower()
                        == "paid"
                    ):

                        response_text += (
                            " Please allow some time for "
                            "the restaurant to update the "
                            "order status."
                        )

                    state[
                        "response"
                    ] = response_text

                    # ------------------------------------------------
                    # Normal confirmed + paid
                    # ------------------------------------------------

                    if (
                        str(status)
                        .strip()
                        .lower()
                        == "confirmed"
                        and
                        str(payment_status)
                        .strip()
                        .lower()
                        == "paid"
                    ):

                        state[
                            "requires_escalation"
                        ] = False

                        state[
                            "ticket_id"
                        ] = None

    # ========================================================
    # FINAL FACTUAL MENU SAFETY CHECK
    # ========================================================
    #
    # MongoDB is authoritative for menu/outlet information.
    #
    # Never allow Gemini or previous conversation context
    # to substitute another outlet's menu.
    # ========================================================

    if intent == "menu_issue":

        requested_menu_id = entities.get(
            "menu_id"
        )

        requested_outlet_id = entities.get(
            "outlet_id"
        )

        # ----------------------------------------------------
        # Menu requested by Menu ID
        # ----------------------------------------------------

        if requested_menu_id:

            verified_menu = _find_verified_menu(
                state.get(
                    "tool_results",
                    [],
                ),
                requested_menu_id=requested_menu_id,
            )

            normalized_menu_id = (
                str(
                    requested_menu_id
                )
                .strip()
                .upper()
            )

            if verified_menu is None:

                ticket_id = state.get(
                    "ticket_id"
                )

                if ticket_id:

                    state[
                        "response"
                    ] = (
                        f"I couldn't find menu "
                        f"**{normalized_menu_id}** "
                        f"in our system. I've created "
                        f"support ticket **{ticket_id}** "
                        f"so our team can verify it."
                    )

                else:

                    state[
                        "response"
                    ] = (
                        f"I couldn't find menu "
                        f"**{normalized_menu_id}** "
                        f"in our system."
                    )

                state[
                    "requires_escalation"
                ] = True

            else:

                menu_id = verified_menu.get(
                    "menu_id",
                    normalized_menu_id,
                )

                menu_status = verified_menu.get(
                    "status",
                    "unknown",
                )

                state[
                    "response"
                ] = (
                    f"I checked menu **{menu_id}**. "
                    f"The menu is currently "
                    f"**{menu_status}**."
                )

        # ----------------------------------------------------
        # Menu requested by Outlet ID
        # ----------------------------------------------------

        elif requested_outlet_id:

            verified_menu = _find_verified_menu(
                state.get(
                    "tool_results",
                    [],
                ),
                requested_outlet_id=requested_outlet_id,
            )

            normalized_outlet_id = (
                str(
                    requested_outlet_id
                )
                .strip()
                .upper()
            )

            # ------------------------------------------------
            # No menu for requested outlet
            # ------------------------------------------------

            if verified_menu is None:

                ticket_id = state.get(
                    "ticket_id"
                )

                if ticket_id:

                    state[
                        "response"
                    ] = (
                        f"I couldn't find a menu for "
                        f"outlet **{normalized_outlet_id}** "
                        f"in our system. I've created "
                        f"support ticket **{ticket_id}** "
                        f"so our team can verify the "
                        f"menu configuration."
                    )

                else:

                    state[
                        "response"
                    ] = (
                        f"I couldn't find a menu for "
                        f"outlet **{normalized_outlet_id}** "
                        f"in our system."
                    )

                state[
                    "requires_escalation"
                ] = True

            # ------------------------------------------------
            # Verified menu
            # ------------------------------------------------

            else:

                menu_id = verified_menu.get(
                    "menu_id",
                    "unknown",
                )

                menu_status = verified_menu.get(
                    "status",
                    "unknown",
                )

                state[
                    "response"
                ] = (
                    f"I checked menu **{menu_id}** "
                    f"for outlet "
                    f"**{normalized_outlet_id}**. "
                    f"The menu is currently "
                    f"**{menu_status}**."
                )

    # ========================================================
    # RETURN
    # ========================================================

    return state