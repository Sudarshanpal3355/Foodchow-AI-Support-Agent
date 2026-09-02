from google import genai
from google.genai import types

from backend.app.core.config import settings
from backend.app.llm.prompts import SYSTEM_PROMPT


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# =========================================================
# NORMALIZE STATUS
# =========================================================

def _normalize_status(value) -> str:
    if value is None:
        return ""

    return str(value).strip().lower()


# =========================================================
# NORMALIZE ORDER ID
# =========================================================

def _normalize_order_id(value) -> str:
    """
    Converts:

        ORD1001
        ORD-1001

    into:

        ORD1001
    """

    if value is None:
        return ""

    return (
        str(value)
        .strip()
        .upper()
        .replace("-", "")
    )


# =========================================================
# GET SUCCESSFUL TOOL DATA
# =========================================================

def _get_successful_tool_data(
    tool_results: list | None,
) -> list[dict]:

    successful_data = []

    for result in tool_results or []:

        if not isinstance(result, dict):
            continue

        if result.get("success") is not True:
            continue

        # -------------------------------------------------
        # Standard:
        #
        # {"success": True, "data": {...}}
        # -------------------------------------------------

        data = result.get("data")

        if isinstance(data, dict):

            successful_data.append(data)

        # -------------------------------------------------
        # Entity-specific results
        # -------------------------------------------------

        for key in [
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
        ]:

            entity_data = result.get(key)

            if isinstance(entity_data, dict):

                successful_data.append(
                    entity_data
                )

    return successful_data


# =========================================================
# FIND ORDER DATA
# =========================================================

def _find_order_data(
    successful_data: list[dict],
    requested_order_id: str | None = None,
) -> dict | None:
    """
    Find a verified order.

    If requested_order_id is supplied, the returned order
    MUST have the same order ID.

    This prevents unrelated tool data from being treated
    as the customer's order.
    """

    requested_normalized = _normalize_order_id(
        requested_order_id
    )

    for data in successful_data:

        if not isinstance(data, dict):
            continue

        # -------------------------------------------------
        # Do not treat payment records as orders.
        # -------------------------------------------------

        if data.get("payment_id"):
            continue

        candidate_order_id = data.get(
            "order_id"
        )

        if not candidate_order_id:
            continue

        candidate_normalized = _normalize_order_id(
            candidate_order_id
        )

        # -------------------------------------------------
        # If an order ID was requested, it MUST match.
        # -------------------------------------------------

        if requested_normalized:

            if (
                candidate_normalized
                != requested_normalized
            ):
                continue

        return data

    return None


# =========================================================
# FIND PAYMENT DATA
# =========================================================

def _find_payment_data(
    successful_data: list[dict],
) -> dict | None:

    for data in successful_data:

        if not isinstance(data, dict):
            continue

        if data.get("payment_id"):

            return data

    return None


# =========================================================
# FIND REFUND DATA
# =========================================================

def _find_refund_data(
    successful_data: list[dict],
) -> dict | None:

    for data in successful_data:

        if not isinstance(data, dict):
            continue

        if (
            data.get("refund_id")
            or data.get("refund_status")
        ):

            return data

    return None


# =========================================================
# CHECK TOOL FAILURE
# =========================================================

def _has_tool_failure(
    tool_results: list | None,
) -> bool:

    for result in tool_results or []:

        if (
            isinstance(result, dict)
            and result.get("success") is False
        ):

            return True

    return False


# =========================================================
# LOCAL FOODCHOW RESPONSE
# =========================================================

def generate_local_response(
    user_message: str,
    intent: str | None = None,
    entities: dict | None = None,
    tool_results: list | None = None,
    root_cause: str | None = None,
    requires_escalation: bool = False,
) -> str:

    entities = entities or {}
    tool_results = tool_results or []

    successful_data = _get_successful_tool_data(
        tool_results
    )

    tool_failed = _has_tool_failure(
        tool_results
    )

    # =====================================================
    # IDENTIFIERS
    # =====================================================

    order_id = entities.get("order_id")
    customer_id = entities.get("customer_id")
    restaurant_id = entities.get("restaurant_id")
    outlet_id = entities.get("outlet_id")
    menu_id = entities.get("menu_id")
    printer_id = entities.get("printer_id")
    kds_id = entities.get("kds_id")
    account_id = entities.get("account_id")

    # =====================================================
    # PAYMENT ISSUE
    # =====================================================

    if intent == "payment_issue":

        payment_data = _find_payment_data(
            successful_data
        )

        order_data = _find_order_data(
            successful_data,
            order_id,
        )

        payment_status = ""
        payment_order_id = None

        if payment_data:

            payment_status = _normalize_status(
                payment_data.get("status")
            )

            payment_order_id = payment_data.get(
                "order_id"
            )

        order_status = ""
        order_payment_status = ""
        order_order_id = None

        if order_data:

            order_status = _normalize_status(
                order_data.get("status")
            )

            order_payment_status = _normalize_status(
                order_data.get("payment_status")
            )

            order_order_id = order_data.get(
                "order_id"
            )

        reference = (
            order_id
            or order_order_id
            or payment_order_id
            or "your order"
        )

        if (
            payment_status == "success"
            and order_status == "pending"
        ):

            return (
                f"Your payment for {reference} was successfully "
                "processed, but your order is still pending. "
                "We have identified the issue and escalated it "
                "to our support team for further assistance."
            )

        if (
            payment_status == "success"
            and order_status == "failed"
        ):

            return (
                f"Your payment for {reference} was successfully "
                "processed, but the order has failed. This issue "
                "requires further assistance and has been "
                "escalated to our support team."
            )

        if payment_status in {
            "failed",
            "declined",
        }:

            return (
                f"The payment for {reference} could not be "
                "completed successfully. Please verify your "
                "payment method and try again. If your account "
                "was charged despite the failed payment, our "
                "support team can investigate it."
            )

        if payment_status == "pending":

            return (
                f"The payment for {reference} is currently "
                "pending. Please allow some time for the "
                "payment status to update."
            )

        if payment_status == "success":

            return (
                f"Your payment for {reference} was successfully "
                "processed. If you are still experiencing an "
                "issue with your order, our support team can "
                "investigate it."
            )

        if tool_failed:

            return (
                "We were unable to retrieve the complete payment "
                "information for your request. Our support team "
                "can investigate it further."
            )

        return (
            "We understand that you are experiencing a payment "
            "issue. Our support team can assist you further."
        )

    # =====================================================
    # ORDER ISSUE
    # =====================================================

    if intent == "order_issue":

        # -------------------------------------------------
        # IMPORTANT:
        # Require exact requested order ID.
        # -------------------------------------------------

        order_data = _find_order_data(
            successful_data,
            order_id,
        )

        # =================================================
        # VERIFIED ORDER FOUND
        # =================================================

        if order_data:

            status = _normalize_status(
                order_data.get("status")
            )

            payment_status = _normalize_status(
                order_data.get("payment_status")
            )

            verified_order_id = order_data.get(
                "order_id"
            )

            reference = (
                verified_order_id
                or order_id
                or "your order"
            )

            total_amount = order_data.get(
                "total_amount"
            )

            # -------------------------------------------------
            # PENDING
            # -------------------------------------------------

            if status == "pending":

                response = (
                    f"Your order **{reference}** is currently "
                    "**pending**"
                )

                if payment_status:

                    response += (
                        f" and the payment status is "
                        f"**{payment_status}**"
                    )

                if total_amount is not None:

                    response += (
                        f". The total amount is **{total_amount}**"
                    )

                response += "."

                if requires_escalation:

                    response += (
                        " Our support team has been notified "
                        "and will investigate the issue."
                    )

                else:

                    response += (
                        " Please allow some time for the "
                        "restaurant to update the order status."
                    )

                return response

            # -------------------------------------------------
            # CONFIRMED
            # -------------------------------------------------

            if status == "confirmed":

                response = (
                    f"Your order **{reference}** is currently "
                    "**confirmed**"
                )

                if payment_status:

                    response += (
                        f" and the payment status is "
                        f"**{payment_status}**"
                    )

                if total_amount is not None:

                    response += (
                        f". The total amount is **{total_amount}**"
                    )

                response += "."

                return response

            # -------------------------------------------------
            # FAILED
            # -------------------------------------------------

            if status == "failed":

                return (
                    f"Your order **{reference}** has **failed**. "
                    "Our support team can assist you with this "
                    "issue."
                )

            # -------------------------------------------------
            # CANCELLED
            # -------------------------------------------------

            if status in {
                "cancelled",
                "canceled",
            }:

                return (
                    f"Your order **{reference}** has been "
                    "**cancelled**. If you believe this was "
                    "unexpected, our support team can investigate "
                    "the cancellation."
                )

            # -------------------------------------------------
            # DELAYED
            # -------------------------------------------------

            if status == "delayed":

                return (
                    f"Your order **{reference}** is currently "
                    "**delayed**. Our support team can assist "
                    "you with the delivery status."
                )

            # -------------------------------------------------
            # COMPLETED
            # -------------------------------------------------

            if status in {
                "completed",
                "delivered",
            }:

                return (
                    f"Your order **{reference}** has been "
                    f"**{status}**. Please let us know if you "
                    "need any further assistance."
                )

            # -------------------------------------------------
            # OTHER VERIFIED STATUS
            # -------------------------------------------------

            if status:

                return (
                    f"Your order **{reference}** is currently "
                    f"**{status}**."
                )

        # =================================================
        # ORDER NOT FOUND
        # =================================================

        if order_id:

            if requires_escalation:

                return (
                    f"We could not find order **{order_id}** "
                    "in the system. Your request has been "
                    "escalated to our support team for further "
                    "investigation."
                )

            return (
                f"We could not find order **{order_id}** "
                "in the system. Please verify the order ID "
                "and try again."
            )

        # =================================================
        # TOOL FAILURE
        # =================================================

        if tool_failed:

            if requires_escalation:

                return (
                    "We were unable to retrieve your order "
                    "information. Your request has been "
                    "escalated to our support team for further "
                    "investigation."
                )

            return (
                "We were unable to retrieve the complete order "
                "information. Please try again."
            )

        # =================================================
        # NO ORDER ID
        # =================================================

        return (
            "We understand that you are experiencing an order "
            "issue. Please provide your order ID so we can "
            "check the order details."
        )

    # =====================================================
    # REFUND ISSUE
    # =====================================================

    if intent == "refund_issue":

        refund_data = _find_refund_data(
            successful_data
        )

        if refund_data:

            status = _normalize_status(
                refund_data.get("refund_status")
                or refund_data.get("status")
            )

            if status == "pending":

                return (
                    "Your refund is currently being processed. "
                    "Please allow some time for the refund to "
                    "complete."
                )

            if status in {
                "success",
                "completed",
                "refunded",
            }:

                return (
                    "Your refund has been successfully processed. "
                    "If you have not received the amount yet, "
                    "please allow some time for it to appear "
                    "in your account."
                )

            if status in {
                "failed",
                "declined",
            }:

                return (
                    "Your refund could not be completed successfully. "
                    "Our support team can investigate the issue "
                    "and assist you further."
                )

            if status:

                return (
                    f"Your refund is currently in '{status}' "
                    "status. Our support team can assist you "
                    "further if needed."
                )

        if tool_failed:

            return (
                "We were unable to retrieve the refund information. "
                "Our support team can investigate this further."
            )

        return (
            "We understand that you need assistance with a "
            "refund. Our support team can investigate this further."
        )

    # =====================================================
    # PRINTER ISSUE
    # =====================================================

    if intent == "printer_issue":

        printer_data = None

        for data in successful_data:

            if (
                data.get("printer_id")
                or data.get("connection_status") is not None
            ):

                printer_data = data
                break

        if printer_data:

            status = _normalize_status(
                printer_data.get("status")
            )

            connection_status = _normalize_status(
                printer_data.get("connection_status")
            )

            printer_reference = (
                printer_id
                or printer_data.get("printer_id")
                or "the printer"
            )

            if (
                status == "online"
                and connection_status == "connected"
            ):

                return (
                    f"Printer {printer_reference} is currently "
                    "online and connected. The printer appears "
                    "to be operating normally."
                )

            if (
                status == "offline"
                or connection_status == "disconnected"
            ):

                return (
                    f"Printer {printer_reference} is currently "
                    "offline or disconnected. Please check that "
                    "it is powered on and connected to the network. "
                    "Our support team can assist you further."
                )

            if status:

                return (
                    f"Printer {printer_reference} is currently "
                    f"'{status}'. Please let us know if you need "
                    "further assistance."
                )

        if requires_escalation:

            return (
                "We identified an issue with the printer that "
                "requires further assistance. Your request has "
                "been escalated to our support team."
            )

        if tool_failed:

            return (
                "We were unable to retrieve the printer status. "
                "Our support team can investigate the issue "
                "further."
            )

        return (
            "We could not retrieve the printer status. "
            "Please provide the printer ID."
        )

    # =====================================================
    # KDS ISSUE
    # =====================================================

    if intent == "kds_issue":

        kds_data = None

        for data in successful_data:

            if (
                data.get("kds_id")
                or data.get("connection_status") is not None
            ):

                kds_data = data
                break

        if kds_data:

            status = _normalize_status(
                kds_data.get("status")
            )

            connection_status = _normalize_status(
                kds_data.get("connection_status")
            )

            kds_reference = (
                kds_id
                or kds_data.get("kds_id")
                or "the kitchen display system"
            )

            if (
                status == "online"
                and connection_status == "connected"
            ):

                return (
                    f"KDS {kds_reference} is currently online "
                    "and connected. The kitchen display system "
                    "appears to be operating normally."
                )

            if (
                status == "offline"
                or connection_status == "disconnected"
            ):

                return (
                    f"KDS {kds_reference} is currently offline "
                    "or disconnected. Please check its power "
                    "and network connection. Our support team "
                    "can assist you further."
                )

            if status:

                return (
                    f"KDS {kds_reference} is currently "
                    f"'{status}'. Please let us know if you "
                    "need further assistance."
                )

        if requires_escalation:

            return (
                "We identified an issue with the kitchen display "
                "system that requires further assistance. Your "
                "request has been escalated to our support team."
            )

        if tool_failed:

            return (
                "We were unable to retrieve the KDS status. "
                "Our support team can investigate the issue "
                "further."
            )

        return (
            "We could not retrieve the kitchen display system "
            "status. Please provide the KDS ID."
        )

    # =====================================================
    # ACCOUNT ISSUE
    # =====================================================

    if intent == "account_issue":

        for data in successful_data:

            status = _normalize_status(
                data.get("status")
            )

            security_status = _normalize_status(
                data.get("security_status")
            )

            reference = (
                account_id
                or data.get("account_id")
                or "your account"
            )

            if (
                status == "locked"
                or security_status == "requires_verification"
            ):

                return (
                    f"Account {reference} is currently locked "
                    "or requires verification. Our support team "
                    "can assist you with resolving this issue."
                )

            if status == "active":

                return (
                    f"Account {reference} is currently active "
                    "and does not appear to be locked."
                )

        if requires_escalation:

            return (
                "Your account issue requires further verification. "
                "Your request has been escalated to our support team."
            )

        if tool_failed:

            return (
                "We were unable to retrieve your account status. "
                "Our support team can investigate the issue further."
            )

        return (
            "We understand that you are experiencing an account "
            "or login issue. Our support team can assist you."
        )

    # =====================================================
    # MENU ISSUE
    # =====================================================

    if intent == "menu_issue":

        menu_data = None

        for data in successful_data:

            if (
                data.get("menu_id")
                or data.get("outlet_id")
                or data.get("menu_name")
                or data.get("items") is not None
            ):

                menu_data = data
                break

        if menu_data:

            menu_reference = (
                menu_id
                or menu_data.get("menu_id")
                or "the menu"
            )

            menu_status = _normalize_status(
                menu_data.get("status")
            )

            menu_outlet_id = (
                outlet_id
                or menu_data.get("outlet_id")
            )

            if menu_status == "active":

                if menu_outlet_id:

                    return (
                        f"I checked the menu assigned to outlet "
                        f"{menu_outlet_id}. Menu {menu_reference} "
                        "is currently active."
                    )

                return (
                    f"I checked menu {menu_reference}. "
                    "It is currently active."
                )

            if menu_status in {
                "inactive",
                "disabled",
                "draft",
            }:

                return (
                    f"I checked menu {menu_reference}. "
                    f"Its current status is '{menu_status}'. "
                    "The menu may need to be activated or "
                    "published before it appears at the outlet."
                )

            if menu_status == "published":

                return (
                    f"I checked menu {menu_reference}. "
                    "The menu is currently published. If it is "
                    "not showing at the outlet, the issue may be "
                    "related to synchronization or configuration."
                )

            return (
                f"I found menu {menu_reference}, but its current "
                "status is not available."
            )

        if tool_failed:

            return (
                "I was unable to retrieve the menu information. "
                "Please provide your Outlet ID or Menu ID."
            )

        return (
            "I can help check the menu. Please provide your "
            "Outlet ID or Menu ID."
        )

    # =====================================================
    # OUTLET ISSUE
    # =====================================================

    if intent == "outlet_issue":

        if outlet_id:

            return (
                f"We received your request regarding outlet "
                f"{outlet_id}. Our support team can check the "
                "outlet information and assist you further."
            )

        return (
            "We understand that you need assistance with an "
            "outlet. Our support team can check the outlet "
            "information and help resolve the issue."
        )

    # =====================================================
    # RESTAURANT ISSUE
    # =====================================================

    if intent == "restaurant_issue":

        if restaurant_id:

            return (
                f"We received your request regarding restaurant "
                f"{restaurant_id}. Our support team can check "
                "the restaurant information and assist you further."
            )

        return (
            "We understand that you need assistance with the "
            "restaurant. Our support team can check the relevant "
            "restaurant information and assist you further."
        )

    # =====================================================
    # GENERAL SUPPORT
    # =====================================================

    if intent == "general_support":

        if requires_escalation:

            return (
                "Thank you for contacting FoodChow Support. "
                "We have received your request and it requires "
                "further assistance. Your issue has been "
                "escalated to our support team."
            )

        return (
            "Thank you for contacting FoodChow Support. "
            "We have received your request successfully. "
            "Please provide any relevant order, account, "
            "restaurant, or outlet details so we can assist "
            "you further."
        )

    # =====================================================
    # UNKNOWN INTENT
    # =====================================================

    return (
        "Thank you for contacting FoodChow Support. "
        "We have received your request successfully. "
        "Our support team can assist you further."
    )


# =========================================================
# MAIN GEMINI RESPONSE FUNCTION
# =========================================================

def generate_response(
    user_message: str,
    system_prompt: str | None = None,
    intent: str | None = None,
    entities: dict | None = None,
    tool_results: list | None = None,
    root_cause: str | None = None,
    requires_escalation: bool = False,
) -> str:

    instructions = (
        system_prompt
        or SYSTEM_PROMPT
    )

    entities = entities or {}
    tool_results = tool_results or []

    # =====================================================
    # HARD ORDER VERIFICATION
    # =====================================================
    #
    # This executes BEFORE Gemini.
    #
    # Gemini is completely bypassed when:
    #
    #   ORD9999 requested
    #       +
    #   no verified ORD9999 record
    #
    # Therefore Gemini cannot invent "open".
    # =====================================================

    if intent == "order_issue":

        order_id = entities.get(
            "order_id"
        )

        if order_id:

            successful_data = (
                _get_successful_tool_data(
                    tool_results
                )
            )

            verified_order = _find_order_data(
                successful_data,
                order_id,
            )

            # -------------------------------------------------
            # ORDER DOES NOT EXIST
            # -------------------------------------------------

            if not verified_order:

                print()
                print("=" * 70)
                print("ORDER VERIFICATION")
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

                return generate_local_response(
                    user_message=user_message,
                    intent=intent,
                    entities=entities,
                    tool_results=[],
                    root_cause=root_cause,
                    requires_escalation=requires_escalation,
                )

            # -------------------------------------------------
            # ORDER FOUND BUT ID MISMATCH
            # -------------------------------------------------

            verified_id = _normalize_order_id(
                verified_order.get("order_id")
            )

            requested_id = _normalize_order_id(
                order_id
            )

            if verified_id != requested_id:

                print()
                print("=" * 70)
                print("ORDER VERIFICATION FAILED")
                print("=" * 70)
                print(
                    f"Requested order : {requested_id}"
                )
                print(
                    f"Returned order : {verified_id}"
                )
                print(
                    "Gemini response : BYPASSED"
                )
                print("=" * 70)
                print()

                return generate_local_response(
                    user_message=user_message,
                    intent=intent,
                    entities=entities,
                    tool_results=[],
                    root_cause=root_cause,
                    requires_escalation=requires_escalation,
                )

    # =====================================================
    # BUILD VERIFIED TOOL CONTEXT
    # =====================================================

    tool_context_parts = []

    for result in tool_results:

        if not isinstance(result, dict):
            continue

        tool_name = result.get(
            "tool",
            "unknown_tool",
        )

        success = result.get(
            "success",
            False,
        )

        tool_context_parts.append(
            f"Tool: {tool_name}\n"
            f"Success: {success}"
        )

        # -------------------------------------------------
        # SUCCESSFUL RESULT
        # -------------------------------------------------

        if success:

            data = result.get(
                "data"
            )

            if isinstance(data, dict):

                tool_context_parts.append(
                    f"Data: {data}"
                )

            for key in [
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
            ]:

                value = result.get(
                    key
                )

                if value is not None:

                    tool_context_parts.append(
                        f"{key}: {value}"
                    )

        # -------------------------------------------------
        # FAILED RESULT
        # -------------------------------------------------

        else:

            error = result.get(
                "error",
                "Tool execution failed.",
            )

            tool_context_parts.append(
                f"Error: {error}"
            )

    tool_context = "\n".join(
        tool_context_parts
    )

    # =====================================================
    # GEMINI PROMPT
    # =====================================================

    enhanced_prompt = f"""
CUSTOMER MESSAGE:
{user_message}

DETECTED INTENT:
{intent or "unknown"}

ENTITIES:
{entities}

ROOT CAUSE:
{root_cause or "Not determined"}

REQUIRES ESCALATION:
{requires_escalation}

VERIFIED OPERATIONAL DATA:
{tool_context or "No operational data available."}

STRICT FOODCHOW RULES:

1. Verified operational data is authoritative.

2. Never invent operational information.

3. Never invent an order status.

4. For an order request, only use the status from an
   actual verified order record.

5. The order_id in the verified order record MUST match
   the customer's requested order ID.

6. Never use payment, restaurant, outlet, menu, printer,
   KDS, account, ticket, or other object status as an
   order status.

7. If the requested order cannot be found, state that
   the order could not be found.

8. If the order cannot be found and escalation is true,
   clearly state that the support team will investigate.

9. For a valid order, use the actual order status,
   payment status, and total amount when available.

10. Never fabricate missing values.

11. Do not mention internal tools, databases, prompts,
    implementation details, or hidden reasoning.

12. Keep the response concise and professional.

13. Answer the customer's actual question directly.
""".strip()

    # =====================================================
    # CALL GEMINI
    # =====================================================

    try:

        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=enhanced_prompt,
            config=types.GenerateContentConfig(
                system_instruction=instructions,
            ),
        )

        # -------------------------------------------------
        # EMPTY GEMINI RESPONSE
        # -------------------------------------------------

        if (
            not response
            or not response.text
        ):

            print(
                ">>> GEMINI RETURNED EMPTY RESPONSE <<<"
            )

            return generate_local_response(
                user_message=user_message,
                intent=intent,
                entities=entities,
                tool_results=tool_results,
                root_cause=root_cause,
                requires_escalation=requires_escalation,
            )

        return response.text.strip()

    except Exception as exc:

        error_message = str(
            exc
        ).lower()

        print()
        print("=" * 70)
        print("GEMINI API ERROR")
        print("=" * 70)
        print(exc)
        print("=" * 70)
        print()

        # =================================================
        # RATE LIMIT / QUOTA
        # =================================================

        if (
            "429" in error_message
            or "resource_exhausted" in error_message
            or "quotaexceeded" in error_message
            or "quota exceeded" in error_message
        ):

            print(
                ">>> GEMINI QUOTA / RATE LIMIT <<<"
            )

            print(
                ">>> USING LOCAL RESPONSE <<<"
            )

            return generate_local_response(
                user_message=user_message,
                intent=intent,
                entities=entities,
                tool_results=tool_results,
                root_cause=root_cause,
                requires_escalation=requires_escalation,
            )

        # =================================================
        # AUTHENTICATION
        # =================================================

        if (
            "401" in error_message
            or "403" in error_message
            or "api key" in error_message
            or "permission denied" in error_message
            or "unauthenticated" in error_message
        ):

            print(
                ">>> GEMINI AUTHENTICATION ERROR <<<"
            )

            return generate_local_response(
                user_message=user_message,
                intent=intent,
                entities=entities,
                tool_results=tool_results,
                root_cause=root_cause,
                requires_escalation=requires_escalation,
            )

        # =================================================
        # MODEL NOT FOUND
        # =================================================

        if (
            "404" in error_message
            or "model not found" in error_message
            or "modelnotfound" in error_message
        ):

            print(
                ">>> GEMINI MODEL ERROR <<<"
            )

            print(
                "Configured model:",
                settings.GEMINI_MODEL,
            )

            return generate_local_response(
                user_message=user_message,
                intent=intent,
                entities=entities,
                tool_results=tool_results,
                root_cause=root_cause,
                requires_escalation=requires_escalation,
            )

        # =================================================
        # NETWORK / TIMEOUT
        # =================================================

        if (
            "connection" in error_message
            or "timeout" in error_message
            or "timed out" in error_message
            or "timedout" in error_message
            or "network" in error_message
        ):

            print(
                ">>> GEMINI NETWORK ERROR <<<"
            )

            return generate_local_response(
                user_message=user_message,
                intent=intent,
                entities=entities,
                tool_results=tool_results,
                root_cause=root_cause,
                requires_escalation=requires_escalation,
            )

        # =================================================
        # UNKNOWN ERROR
        # =================================================

        print(
            ">>> UNKNOWN GEMINI ERROR <<<"
        )

        return generate_local_response(
            user_message=user_message,
            intent=intent,
            entities=entities,
            tool_results=tool_results,
            root_cause=root_cause,
            requires_escalation=requires_escalation,
        )