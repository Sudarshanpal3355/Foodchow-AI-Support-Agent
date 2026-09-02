import re

from backend.app.agent.state import AgentState
from backend.app.llm.client import generate_response


# =========================================================
# RESPONSE CLEANING
# =========================================================

def _clean_response(response: str) -> str:
    """
    Clean common formatting problems produced by the LLM.

    This function only fixes formatting.
    It does not change the meaning of the response.
    """

    if not isinstance(response, str):
        return response

    response = re.sub(
        r"\s+",
        " ",
        response,
    ).strip()

    replacements = {
        "Pleaseprovide": "Please provide",
        "Pleasecheck": "Please check",
        "Pleasetry": "Please try",
        "pleaseprovide": "please provide",
        "provideyour": "provide your",
        "checkthe": "check the",
        "checkwhy": "check why",
        "yourorder": "your order",
        "yourmenu": "your menu",
        "yourprinter": "your printer",
        "yourKDS": "your KDS",
        "atthe": "at the",
        "inthe": "in the",
        "onthe": "on the",
        "forthe": "for the",
        "fromthe": "from the",
        "tothe": "to the",
        "withthe": "with the",
        "ofthe": "of the",
        "andthe": "and the",
        "iscurrently": "is currently",
        "arecurrently": "are currently",
        "currentlypending": "currently pending",
        "currentlyfailed": "currently failed",
        "currentlycancelled": "currently cancelled",
        "currentlycanceled": "currently canceled",
        "currentlydelayed": "currently delayed",
        "currentlyonline": "currently online",
        "currentlyoffline": "currently offline",
        "isnot": "is not",
        "isstill": "is still",
        "orderORD": "order ORD",
        "menuMENU": "menu MENU",
        "outletOUT": "outlet OUT",
        "printerPRN": "printer PRN",
        "KDSKDS": "KDS KDS",
        "ticketTKT": "ticket TKT",
    }

    for old, new in replacements.items():
        response = response.replace(old, new)

    response = re.sub(
        r"\border(?=ORD-?\d+)",
        "order ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\bmenu(?=MENU\d+)",
        "menu ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\boutlet(?=OUT\d+)",
        "outlet ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\bprinter(?=PRN\d+)",
        "printer ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\bKDS(?=KDS\d+)",
        "KDS ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\bticket(?=TKT(?:\d+|-[A-F0-9]+))",
        "ticket ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\bcurrently(?=[A-Za-z])",
        "currently ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\bPlease(?=[A-Za-z])",
        "Please ",
        response,
    )

    response = re.sub(
        r"\bprovide(?=[A-Za-z])",
        "provide ",
        response,
        flags=re.IGNORECASE,
    )

    response = re.sub(
        r"\s+",
        " ",
        response,
    ).strip()

    return response


# =========================================================
# ORDER ID NORMALIZATION
# =========================================================

def _normalize_order_id(value) -> str:
    """
    Normalize:

        ORD1001
        ORD-1001

    into:

        ORD1001
    """

    if value is None:
        return ""

    value = str(value).strip().upper()

    return value.replace("-", "")


# =========================================================
# EXTRACT SUCCESSFUL DATA
# =========================================================

def _get_successful_data(
    tool_results: list | None,
) -> list[dict]:
    """
    Extract only successful operational entities.

    Supports:

        {"success": True, "data": {...}}

    and:

        {"success": True, "order": {...}}
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

    for result in tool_results or []:

        if not isinstance(result, dict):
            continue

        if result.get("success") is not True:
            continue

        data = result.get("data")

        if isinstance(data, dict):
            successful_data.append(data)

        for key in entity_keys:

            candidate = result.get(key)

            if isinstance(candidate, dict):
                successful_data.append(candidate)

    return successful_data


# =========================================================
# FIND VERIFIED ORDER
# =========================================================

def _find_verified_order(
    tool_results: list | None,
    requested_order_id: str | None,
) -> dict | None:
    """
    Find an actual order returned by the operational tool.

    The returned order MUST have exactly the same normalized
    order ID as the customer's requested order ID.
    """

    requested_id = _normalize_order_id(
        requested_order_id
    )

    if not requested_id:
        return None

    successful_data = _get_successful_data(
        tool_results
    )

    for data in successful_data:

        if not isinstance(data, dict):
            continue

        # Payment records are not orders.
        if data.get("payment_id"):
            continue

        candidate_id = data.get("order_id")

        if not candidate_id:
            continue

        candidate_id = _normalize_order_id(
            candidate_id
        )

        if candidate_id == requested_id:

            return data

    return None


# =========================================================
# FIND TICKET ID
# =========================================================

def _get_ticket_id(
    tool_results: list | None,
) -> str | None:

    for result in tool_results or []:

        if not isinstance(result, dict):
            continue

        # Direct ticket ID
        ticket_id = result.get("ticket_id")

        if ticket_id:
            return ticket_id

        # Nested data
        data = result.get("data")

        if isinstance(data, dict):

            ticket_id = data.get(
                "ticket_id"
            )

            if ticket_id:
                return ticket_id

    return None


# =========================================================
# LOCAL ORDER NOT FOUND RESPONSE
# =========================================================

def _order_not_found_response(
    order_id: str,
    requires_escalation: bool,
    tool_results: list | None,
) -> str:

    ticket_id = _get_ticket_id(
        tool_results
    )

    if requires_escalation:

        response = (
            f"We could not find order **{order_id}** "
            "in the system. Your request has been "
            "escalated to our support team for further "
            "investigation."
        )

        if ticket_id:

            response += (
                f" Your support ticket is **{ticket_id}**."
            )

        return response

    return (
        f"We could not find order **{order_id}** "
        "in the system. Please verify the order ID "
        "and try again."
    )


# =========================================================
# DELIVERY DELAY RESPONSE
# =========================================================

def _delivery_delay_response(
    order: dict,
) -> str:
    """
    Generate a response specifically for a delivery-delay
    follow-up using only verified operational order data.

    Never invent an ETA, driver location, or delay reason.
    """

    order_id = order.get("order_id")

    status = str(
        order.get("status", "")
    ).strip().lower()

    payment_status = str(
        order.get("payment_status", "")
    ).strip().lower()

    if status == "delayed":

        response = (
            f"Your order **{order_id}** is currently "
            "**delayed**."
        )

        delay_reason = (
            order.get("delay_reason")
            or order.get("delivery_delay_reason")
        )

        if delay_reason:
            response += (
                f" The reason provided is "
                f"**{delay_reason}**."
            )

        estimated_delivery = (
            order.get("estimated_delivery")
            or order.get("estimated_delivery_time")
            or order.get("eta")
        )

        if estimated_delivery:
            response += (
                f" The estimated delivery time is "
                f"**{estimated_delivery}**."
            )

        response += (
            " Our support team can assist you with "
            "the delivery status."
        )

        return response

    response = (
        f"I checked order **{order_id}**. "
        f"The current order status is "
        f"**{status or 'unknown'}**"
    )

    if payment_status:
        response += (
            f" and the payment status is "
            f"**{payment_status}**"
        )

    response += (
        ". I don't have a confirmed delivery-delay reason "
        "or updated delivery time in the available order "
        "information. Our support team can investigate the "
        "delivery status further."
    )

    return response


# =========================================================
# LOCAL VERIFIED ORDER RESPONSE
# =========================================================

def _verified_order_response(
    order: dict,
    context_type: str | None = None,
) -> str:

    order_id = order.get(
        "order_id"
    )

    if context_type == "delivery_delay":
        return _delivery_delay_response(order)

    status = str(
        order.get(
            "status",
            "",
        )
    ).strip().lower()

    payment_status = str(
        order.get(
            "payment_status",
            "",
        )
    ).strip().lower()

    total_amount = order.get(
        "total_amount"
    )

    # -----------------------------------------------------
    # PENDING
    # -----------------------------------------------------

    if status == "pending":

        response = (
            f"Your order **{order_id}** is currently "
            "**pending**"
        )

        if payment_status:

            response += (
                f" and the payment status is "
                f"**{payment_status}**"
            )

        if total_amount is not None:

            response += (
                f". The total amount is "
                f"**{total_amount}**"
            )

        response += (
            ". Please allow some time for the "
            "restaurant to update the order status."
        )

        return response

    # -----------------------------------------------------
    # CONFIRMED
    # -----------------------------------------------------

    if status == "confirmed":

        response = (
            f"Your order **{order_id}** is currently "
            "**confirmed**"
        )

        if payment_status:

            response += (
                f" and the payment status is "
                f"**{payment_status}**"
            )

        if total_amount is not None:

            response += (
                f". The total amount is "
                f"**{total_amount}**"
            )

        response += "."

        return response

    # -----------------------------------------------------
    # FAILED
    # -----------------------------------------------------

    if status == "failed":

        return (
            f"Your order **{order_id}** has **failed**. "
            "Our support team can assist you with this issue."
        )

    # -----------------------------------------------------
    # CANCELLED
    # -----------------------------------------------------

    if status in {
        "cancelled",
        "canceled",
    }:

        return (
            f"Your order **{order_id}** has been "
            "**cancelled**. If you believe this was "
            "unexpected, our support team can investigate "
            "the cancellation."
        )

    # -----------------------------------------------------
    # DELAYED
    # -----------------------------------------------------

    if status == "delayed":

        return (
            f"Your order **{order_id}** is currently "
            "**delayed**. Our support team can assist "
            "you with the delivery status."
        )

    # -----------------------------------------------------
    # COMPLETED
    # -----------------------------------------------------

    if status in {
        "completed",
        "delivered",
    }:

        return (
            f"Your order **{order_id}** has been "
            f"**{status}**. Please let us know if you "
            "need any further assistance."
        )

    # -----------------------------------------------------
    # OTHER VERIFIED STATUS
    # -----------------------------------------------------

    if status:

        return (
            f"Your order **{order_id}** is currently "
            f"**{status}**."
        )

    return (
        f"We found order **{order_id}**, but its current "
        "status is unavailable."
    )


# =========================================================
# MAIN RESPONSE NODE
# =========================================================

def generate_agent_response(
    state: AgentState,
) -> AgentState:
    """
    Generate the final customer-facing response.

    IMPORTANT:

    For order_issue, this function performs an additional
    hard verification before Gemini is called.

    Gemini can NEVER generate an order status when the
    requested order was not actually returned by the
    operational order lookup.
    """

    # =====================================================
    # EXISTING RESPONSE
    # =====================================================

    existing_response = state.get(
        "response"
    )

    if existing_response:
        return state

    # =====================================================
    # STATE
    # =====================================================

    user_message = state.get(
        "user_message",
        "",
    )

    intent = state.get(
        "intent"
    )

    entities = state.get(
        "entities",
        {},
    )

    tool_results = state.get(
        "tool_results",
        [],
    )

    root_cause = state.get(
        "root_cause"
    )

    confidence = state.get(
        "confidence"
    )

    context_type = state.get(
        "context_type"
    )

    requires_escalation = state.get(
        "requires_escalation",
        False,
    )

    # =====================================================
    # HARD ORDER VERIFICATION
    # =====================================================

    if intent == "order_issue":

        order_id = entities.get(
            "order_id"
        )

        if order_id:

            verified_order = _find_verified_order(
                tool_results,
                order_id,
            )

            # =================================================
            # ORDER DOES NOT EXIST
            # =================================================

            if verified_order is None:

                print()
                print("=" * 70)
                print("FINAL RESPONSE ORDER VERIFICATION")
                print("=" * 70)
                print(
                    f"Requested order : {order_id}"
                )
                print(
                    "Verified order  : NOT FOUND"
                )
                print(
                    "Gemini response : BYPASSED"
                )
                print("=" * 70)
                print()

                state["response"] = _order_not_found_response(
                    order_id=order_id,
                    requires_escalation=requires_escalation,
                    tool_results=tool_results,
                )

                return state

            # =================================================
            # VALID ORDER
            # =================================================

            print()
            print("=" * 70)
            print("FINAL RESPONSE ORDER VERIFICATION")
            print("=" * 70)
            print(
                f"Requested order : {order_id}"
            )
            print(
                f"Verified order  : "
                f"{verified_order.get('order_id')}"
            )
            print(
                "Gemini response : ALLOWED"
            )
            print("=" * 70)
            print()

    # =====================================================
    # RAG
    # =====================================================

    rag_documents = state.get(
        "rag_documents",
        [],
    )

    rag_formatted_citations = state.get(
        "rag_formatted_citations",
        [],
    )

    rag_used = state.get(
        "rag_used",
        False,
    )

    rag_context_parts = []

    for index, document in enumerate(
        rag_documents,
        start=1,
    ):

        if not isinstance(
            document,
            dict,
        ):
            continue

        source = document.get(
            "source",
            "",
        )

        content = document.get(
            "content",
            "",
        )

        if not content:
            continue

        rag_context_parts.append(
            f"""
--- KNOWLEDGE SOURCE {index} ---

SOURCE:
{source}

KNOWLEDGE:
{content}
"""
        )

    rag_context = "\n".join(
        rag_context_parts
    )

    citations_context = "\n".join(
        rag_formatted_citations
    )

    # =====================================================
    # OPERATIONAL RESULTS
    # =====================================================

    operational_results = []

    for result in tool_results:

        if isinstance(
            result,
            dict,
        ):

            operational_results.append(
                result
            )

    # =====================================================
    # GEMINI PROMPT
    # =====================================================

    prompt = f"""
You are the FoodChow AI Support Agent.

Generate a concise customer-facing response.

CUSTOMER MESSAGE:
{user_message}

INTENT:
{intent}

CONTEXT TYPE:
{context_type}

ENTITIES:
{entities}

LIVE OPERATIONAL RESULTS:
{operational_results}

RAG USED:
{rag_used}

RAG KNOWLEDGE:
{rag_context}

CITATIONS:
{citations_context}

ROOT CAUSE:
{root_cause}

CONFIDENCE:
{confidence}

ESCALATION:
{requires_escalation}

STRICT RULES:

1. Live operational data is the source of truth.

2. Never invent operational information.

3. Never invent an order status.

4. For an order request, only use an order status
   from the exact verified order returned by the
   order lookup.

5. The returned order_id must match the requested
   order_id.

6. Never use payment, restaurant, outlet, menu,
   printer, KDS, account or ticket status as an
   order status.

7. Never fabricate missing values.

8. If human escalation is required, clearly explain
   that the request has been escalated.

9. Do not mention internal implementation details.

10. Do not expose hidden reasoning.

11. Keep the response concise and professional.

12. Use proper spaces between words.

13. Answer the customer's current question, not merely the
    previous question in the conversation.

14. If CONTEXT TYPE is delivery_delay, address the delivery-delay
    question specifically using only verified operational data.

15. Never invent an ETA, driver location, delivery time, or delay
    reason when those values are not present in the live data.

16. If the current order status is confirmed but the customer asks
    why the delivery is delayed, explain that the available live
    order information does not contain a confirmed delay reason or
    updated delivery time.
""".strip()

    # =====================================================
    # CALL GEMINI
    # =====================================================

    response = generate_response(
        user_message=prompt,
        intent=intent,
        entities=entities,
        tool_results=tool_results,
        root_cause=root_cause,
        requires_escalation=requires_escalation,
    )

    # =====================================================
    # CLEAN
    # =====================================================

    response = _clean_response(
        response
    )

    # =====================================================
    # FINAL SAFETY CHECK FOR ORDERS
    # =====================================================

    if intent == "order_issue":

        order_id = entities.get(
            "order_id"
        )

        if order_id:

            verified_order = _find_verified_order(
                tool_results,
                order_id,
            )

            # -------------------------------------------------
            # Gemini somehow returned a response without
            # a verified order. Replace it.
            # -------------------------------------------------

            if verified_order is None:

                state["response"] = _order_not_found_response(
                    order_id=order_id,
                    requires_escalation=requires_escalation,
                    tool_results=tool_results,
                )

                return state

            # -------------------------------------------------
            # For maximum safety, use deterministic response
            # for verified orders too.
            # -------------------------------------------------

            state["response"] = _verified_order_response(
                verified_order,
                context_type=context_type,
            )

            return state

    # =====================================================
    # SAVE NORMAL RESPONSE
    # =====================================================

    state["response"] = response

    return state