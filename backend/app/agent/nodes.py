import re

from backend.app.agent.intent import (
    detect_intent,
    extract_entities,
    resolve_contextual_intent,
)
from backend.app.agent.state import AgentState


# =========================================================
# FOLLOW-UP PHRASES
# =========================================================

FOLLOW_UP_PHRASES = [
    "why is it",
    "why is this",
    "why was it",
    "why was this",
    "why did it",
    "why did this",
    "what happened",
    "what is happening",
    "is it still",
    "is this still",
    "when will it",
    "when can i",
    "how long",
    "how much longer",
    "what about it",
    "what about that",
    "can you check it",
    "can you check this",
    "can you check that",
    "please check it",
    "please check this",
    "please check that",
    "check it",
    "check that",
    "any update",
    "any updates",
    "still pending",
    "still waiting",
]


# =========================================================
# DELIVERY / DELAY SIGNALS
# =========================================================

DELIVERY_DELAY_PHRASES = [
    "delay",
    "delayed",
    "late",
    "running late",
    "why is it delayed",
    "why is it late",
    "why was it delayed",
    "why was it late",
    "why is my order delayed",
    "why is my order late",
    "why was my order delayed",
    "why was my order late",
    "when will it arrive",
    "when will it be delivered",
    "when will my order arrive",
    "when will my order be delivered",
    "how long will it take",
    "how much longer",
    "still waiting",
    "still not arrived",
    "not arrived",
    "hasn't arrived",
    "has not arrived",
]


# =========================================================
# ENTITY-ONLY FOLLOW-UP
# =========================================================

ENTITY_ONLY_PATTERN = re.compile(
    r"^\s*"
    r"(?:"
    r"ORD-?\d+"
    r"|CUS\d+"
    r"|TKT(?:\d+|-[A-F0-9]+)"
    r"|REST\d+"
    r"|OUT\d+"
    r"|MENU\d+"
    r"|PRN\d+"
    r"|KDS\d+"
    r"|ACC\d+"
    r")"
    r"\s*$",
    re.IGNORECASE,
)


# =========================================================
# ENTITY MERGING
# =========================================================

def _merge_entities(
    current_entities: dict,
    context_entities: dict,
) -> dict:
    """
    Merge current and context entities.

    Current-message entities have priority.
    """

    merged = {}

    if isinstance(
        context_entities,
        dict,
    ):
        merged.update(
            context_entities
        )

    if isinstance(
        current_entities,
        dict,
    ):
        merged.update(
            current_entities
        )

    return merged


# =========================================================
# ENTITY-ONLY MESSAGE
# =========================================================

def _is_entity_only_message(
    message: str,
) -> bool:

    if not message:
        return False

    return bool(
        ENTITY_ONLY_PATTERN.fullmatch(
            message.strip()
        )
    )


# =========================================================
# EXPLICIT PAYMENT SIGNAL
# =========================================================

def _has_explicit_payment_signal(
    text: str,
) -> bool:

    payment_phrases = [
        "payment",
        "payment status",
        "payment failed",
        "payment pending",
        "payment successful",
        "payment declined",
        "payment not accepted",
        "paid",
        "charged",
        "charge",
        "transaction",
        "billing",
        "money deducted",
        "money was deducted",
        "money has been deducted",
        "charged for",
        "already paid",
    ]

    return any(
        phrase in text
        for phrase in payment_phrases
    )


# =========================================================
# EXPLICIT REFUND SIGNAL
# =========================================================

def _has_explicit_refund_signal(
    text: str,
) -> bool:

    refund_phrases = [
        "refund",
        "refund status",
        "refund pending",
        "refund failed",
        "refund not received",
        "refunded",
        "money back",
        "money has not been refunded",
    ]

    return any(
        phrase in text
        for phrase in refund_phrases
    )


# =========================================================
# EXPLICIT ORDER SIGNAL
# =========================================================

def _has_explicit_order_signal(
    text: str,
) -> bool:

    order_phrases = [
        "order status",
        "track",
        "tracking",
        "where is my order",
        "order confirmation",
        "is my order confirmed",
        "has my order been confirmed",
        "check order",
        "check my order",
        "delivery",
        "deliver",
        "delivered",
        "arrive",
        "arrived",
        "pickup",
        "pending order",
        "cancel order",
        "cancelled order",
        "canceled order",
        "delayed order",
        "late order",
    ]

    return any(
        phrase in text
        for phrase in order_phrases
    )


# =========================================================
# EXPLICIT MENU SIGNAL
# =========================================================

def _has_explicit_menu_signal(
    text: str,
) -> bool:

    menu_phrases = [
        "menu",
        "menus",
        "what is on the menu",
        "what's on the menu",
        "what is on menu",
        "what's on menu",
        "show me the menu",
        "show menu",
        "food menu",
        "food items",
        "food item",
        "what food do you have",
        "what dishes do you have",
        "available dishes",
        "available food",
    ]

    return any(
        phrase in text
        for phrase in menu_phrases
    )


# =========================================================
# EXPLICIT PRINTER SIGNAL
# =========================================================

def _has_explicit_printer_signal(
    text: str,
) -> bool:

    printer_phrases = [
        "printer",
        "printers",
        "printer status",
        "printer issue",
        "printer problem",
        "printer error",
        "printer offline",
        "printer online",
        "printer disconnected",
        "printer connection",
        "printer not working",
        "printer isn't working",
        "printer is not working",
        "printer stopped",
        "printer stopped working",
        "check printer",
        "check the printer",
        "printer health",
        "printing issue",
        "printing problem",
        "print issue",
        "print problem",
        "receipt printer",
    ]

    if any(
        phrase in text
        for phrase in printer_phrases
    ):
        return True

    return bool(
        re.search(
            r"\bPRN\d+\b",
            text,
            re.IGNORECASE,
        )
    )


# =========================================================
# EXPLICIT KDS SIGNAL
# =========================================================

def _has_explicit_kds_signal(
    text: str,
) -> bool:

    kds_phrases = [
        "kds",
        "kitchen display",
        "kitchen display system",
        "kds status",
        "kds issue",
        "kds problem",
        "kds error",
        "kds offline",
        "kds online",
        "kds not working",
        "check kds",
    ]

    if any(
        phrase in text
        for phrase in kds_phrases
    ):
        return True

    return bool(
        re.search(
            r"\bKDS\d+\b",
            text,
            re.IGNORECASE,
        )
    )


# =========================================================
# EXPLICIT ACCOUNT SIGNAL
# =========================================================

def _has_explicit_account_signal(
    text: str,
) -> bool:

    account_phrases = [
        "account",
        "login",
        "log in",
        "signin",
        "sign in",
        "password",
        "forgot password",
        "account locked",
        "account active",
        "account inactive",
        "can't login",
        "cannot login",
        "unable to login",
        "unable to log in",
        "check account",
    ]

    if any(
        phrase in text
        for phrase in account_phrases
    ):
        return True

    return bool(
        re.search(
            r"\bACC\d+\b",
            text,
            re.IGNORECASE,
        )
    )


# =========================================================
# DELIVERY / DELAY FOLLOW-UP
# =========================================================

def _is_delivery_delay_follow_up(
    text: str,
) -> bool:

    normalized = re.sub(
        r"\s+",
        " ",
        text.lower(),
    ).strip()

    return any(
        phrase in normalized
        for phrase in DELIVERY_DELAY_PHRASES
    )


# =========================================================
# ANALYZE CUSTOMER MESSAGE
# =========================================================

def analyze_message(
    state: AgentState,
) -> AgentState:

    user_message = (
        state.get(
            "user_message",
            "",
        )
        or ""
    ).strip()

    conversation_context = (
        state.get(
            "conversation_context",
            "",
        )
        or ""
    ).strip()

    # =====================================================
    # EMPTY REQUEST
    # =====================================================

    if not user_message:

        state["intent"] = "general_support"
        state["confidence"] = 0.0
        state["entities"] = {}

        return state

    # =====================================================
    # CURRENT INTENT
    # =====================================================

    current_intent_result = detect_intent(
        user_message
    )

    current_intent = current_intent_result.get(
        "intent",
        "general_support",
    )

    current_confidence = float(
        current_intent_result.get(
            "confidence",
            0.50,
        )
    )

    # =====================================================
    # CURRENT ENTITIES
    # =====================================================

    current_entities = extract_entities(
        user_message
    )

    if not isinstance(
        current_entities,
        dict,
    ):
        current_entities = {}

    # =====================================================
    # DIRECT CURRENT ENTITY EXTRACTION
    # =====================================================

    printer_match = re.search(
        r"\bPRN\d+\b",
        user_message,
        re.IGNORECASE,
    )

    if printer_match:

        current_entities["printer_id"] = (
            printer_match.group(0).upper()
        )

    kds_match = re.search(
        r"\bKDS\d+\b",
        user_message,
        re.IGNORECASE,
    )

    if kds_match:

        current_entities["kds_id"] = (
            kds_match.group(0).upper()
        )

    account_match = re.search(
        r"\bACC\d+\b",
        user_message,
        re.IGNORECASE,
    )

    if account_match:

        current_entities["account_id"] = (
            account_match.group(0).upper()
        )

    # =====================================================
    # CONTEXT ENTITIES
    # =====================================================

    context_entities = {}

    if conversation_context:

        context_entities = extract_entities(
            conversation_context
        )

        if not isinstance(
            context_entities,
            dict,
        ):
            context_entities = {}

    # =====================================================
    # NORMALIZE MESSAGE
    # =====================================================

    normalized_message = re.sub(
        r"\s+",
        " ",
        user_message.lower(),
    ).strip()

    # =====================================================
    # MESSAGE TYPE
    # =====================================================

    is_entity_only = _is_entity_only_message(
        user_message
    )

    is_phrase_follow_up = any(
        phrase in normalized_message
        for phrase in FOLLOW_UP_PHRASES
    )

    # A delivery-delay question should also be treated
    # as a contextual follow-up when it refers to "it",
    # even if the exact phrase is not in the generic list.

    is_delivery_delay = (
        _is_delivery_delay_follow_up(
            normalized_message
        )
    )

    if is_delivery_delay:
        is_phrase_follow_up = True

    # =====================================================
    # CURRENT SIGNALS
    # =====================================================

    explicit_payment = _has_explicit_payment_signal(
        normalized_message
    )

    explicit_refund = _has_explicit_refund_signal(
        normalized_message
    )

    explicit_order = _has_explicit_order_signal(
        normalized_message
    )

    explicit_menu = _has_explicit_menu_signal(
        normalized_message
    )

    explicit_printer = _has_explicit_printer_signal(
        normalized_message
    )

    explicit_kds = _has_explicit_kds_signal(
        normalized_message
    )

    explicit_account = _has_explicit_account_signal(
        normalized_message
    )

    # =====================================================
    # ORDER ID
    # =====================================================

    order_match = re.search(
        r"\bORD-?\d+\b",
        user_message,
        re.IGNORECASE,
    )

    has_order_id = bool(
        order_match
    )

    # =====================================================
    # CONTEXTUAL INTENT
    # =====================================================

    resolved = resolve_contextual_intent(
        current_intent=current_intent,
        current_confidence=current_confidence,
        current_message=user_message,
        current_entities=current_entities,
        conversation_context=conversation_context,
    )

    resolved_intent = resolved.get(
        "intent",
        current_intent,
    )

    resolved_confidence = float(
        resolved.get(
            "confidence",
            current_confidence,
        )
    )

    # =====================================================
    # CONTEXT TYPE
    # =====================================================

    context_type = resolved.get(
        "context_type"
    )

    # =====================================================
    # ENTITY RULE
    # =====================================================

    if is_entity_only:

        merged_entities = _merge_entities(
            current_entities,
            context_entities,
        )

    elif is_phrase_follow_up:

        # -------------------------------------------------
        # IMPORTANT:
        #
        # Do not merge every entity from the complete
        # conversation.
        #
        # Use only the entity associated with the
        # resolved intent.
        # -------------------------------------------------

        merged_entities = {}

        if resolved_intent == "printer_issue":

            if "printer_id" in current_entities:

                merged_entities["printer_id"] = (
                    current_entities["printer_id"]
                )

            elif "printer_id" in context_entities:

                merged_entities["printer_id"] = (
                    context_entities["printer_id"]
                )

        elif resolved_intent == "kds_issue":

            if "kds_id" in current_entities:

                merged_entities["kds_id"] = (
                    current_entities["kds_id"]
                )

            elif "kds_id" in context_entities:

                merged_entities["kds_id"] = (
                    context_entities["kds_id"]
                )

        elif resolved_intent == "account_issue":

            if "account_id" in current_entities:

                merged_entities["account_id"] = (
                    current_entities["account_id"]
                )

            elif "account_id" in context_entities:

                merged_entities["account_id"] = (
                    context_entities["account_id"]
                )

        elif resolved_intent == "menu_issue":

            if "menu_id" in current_entities:

                merged_entities["menu_id"] = (
                    current_entities["menu_id"]
                )

            elif "menu_id" in context_entities:

                merged_entities["menu_id"] = (
                    context_entities["menu_id"]
                )

            if "outlet_id" in current_entities:

                merged_entities["outlet_id"] = (
                    current_entities["outlet_id"]
                )

            elif "outlet_id" in context_entities:

                merged_entities["outlet_id"] = (
                    context_entities["outlet_id"]
                )

        elif resolved_intent in {
            "payment_issue",
            "refund_issue",
            "order_issue",
        }:

            if "order_id" in current_entities:

                merged_entities["order_id"] = (
                    current_entities["order_id"]
                )

            elif "order_id" in context_entities:

                merged_entities["order_id"] = (
                    context_entities["order_id"]
                )

        else:

            merged_entities = dict(
                current_entities
            )

    else:

        # -------------------------------------------------
        # NEW REQUEST:
        #
        # NEVER inherit old entities.
        # -------------------------------------------------

        merged_entities = dict(
            current_entities
        )

    # =====================================================
    # CURRENT MESSAGE INTENT PRIORITY
    # =====================================================

    if explicit_payment:

        resolved_intent = "payment_issue"
        resolved_confidence = 0.95

    elif explicit_refund:

        resolved_intent = "refund_issue"
        resolved_confidence = 0.95

    elif explicit_menu:

        resolved_intent = "menu_issue"
        resolved_confidence = max(
            0.80,
            current_confidence,
        )

    elif explicit_printer:

        resolved_intent = "printer_issue"
        resolved_confidence = max(
            0.85,
            current_confidence,
        )

    elif explicit_kds:

        resolved_intent = "kds_issue"
        resolved_confidence = max(
            0.85,
            current_confidence,
        )

    elif explicit_account:

        resolved_intent = "account_issue"
        resolved_confidence = max(
            0.80,
            current_confidence,
        )

    elif (
        has_order_id
        and explicit_order
    ):

        resolved_intent = "order_issue"
        resolved_confidence = 0.95

    # =====================================================
    # ENTITY-ONLY MESSAGE
    # =====================================================

    elif is_entity_only:

        if "printer_id" in current_entities:

            resolved_intent = "printer_issue"
            resolved_confidence = 0.90

        elif "kds_id" in current_entities:

            resolved_intent = "kds_issue"
            resolved_confidence = 0.90

        elif "account_id" in current_entities:

            resolved_intent = "account_issue"
            resolved_confidence = 0.90

        elif "menu_id" in current_entities:

            resolved_intent = "menu_issue"
            resolved_confidence = 0.90

        elif "order_id" in current_entities:

            if resolved_intent not in {
                "payment_issue",
                "refund_issue",
            }:

                resolved_intent = "order_issue"

            resolved_confidence = max(
                0.90,
                resolved_confidence,
            )

        elif "outlet_id" in current_entities:

            if resolved_intent != "menu_issue":
                resolved_intent = "outlet_issue"

            resolved_confidence = max(
                0.90,
                resolved_confidence,
            )

    # =====================================================
    # FOLLOW-UP
    # =====================================================

    elif is_phrase_follow_up:

        # -------------------------------------------------
        # Delivery-delay follow-up
        # -------------------------------------------------

        if (
            resolved_intent == "order_issue"
            and is_delivery_delay
        ):

            context_type = "delivery_delay"
            resolved_confidence = max(
                0.95,
                resolved_confidence,
            )

        elif resolved_intent == "printer_issue":

            resolved_confidence = max(
                0.90,
                resolved_confidence,
            )

        elif resolved_intent == "kds_issue":

            resolved_confidence = max(
                0.90,
                resolved_confidence,
            )

        elif resolved_intent == "account_issue":

            resolved_confidence = max(
                0.90,
                resolved_confidence,
            )

        elif resolved_intent == "menu_issue":

            resolved_confidence = max(
                0.90,
                resolved_confidence,
            )

        elif resolved_intent in {
            "order_issue",
            "payment_issue",
            "refund_issue",
        }:

            resolved_confidence = max(
                0.90,
                resolved_confidence,
            )

    # =====================================================
    # NORMALIZE ORDER ID
    # =====================================================

    if "order_id" in merged_entities:

        order_id = merged_entities.get(
            "order_id"
        )

        if order_id:

            merged_entities["order_id"] = (
                str(order_id)
                .strip()
                .upper()
                .replace("-", "")
            )

    # =====================================================
    # NORMALIZE PRINTER ID
    # =====================================================

    if "printer_id" in merged_entities:

        printer_id = merged_entities.get(
            "printer_id"
        )

        if printer_id:

            merged_entities["printer_id"] = (
                str(printer_id)
                .strip()
                .upper()
            )

    # =====================================================
    # NORMALIZE KDS ID
    # =====================================================

    if "kds_id" in merged_entities:

        kds_id = merged_entities.get(
            "kds_id"
        )

        if kds_id:

            merged_entities["kds_id"] = (
                str(kds_id)
                .strip()
                .upper()
            )

    # =====================================================
    # NORMALIZE ACCOUNT ID
    # =====================================================

    if "account_id" in merged_entities:

        account_id = merged_entities.get(
            "account_id"
        )

        if account_id:

            merged_entities["account_id"] = (
                str(account_id)
                .strip()
                .upper()
            )

    # =====================================================
    # GUARANTEE CURRENT IDENTIFIERS
    # =====================================================

    if order_match:

        merged_entities["order_id"] = (
            order_match.group(0)
            .upper()
            .replace("-", "")
        )

    if printer_match:

        merged_entities["printer_id"] = (
            printer_match.group(0)
            .upper()
        )

    if kds_match:

        merged_entities["kds_id"] = (
            kds_match.group(0)
            .upper()
        )

    if account_match:

        merged_entities["account_id"] = (
            account_match.group(0)
            .upper()
        )

    # =====================================================
    # FINAL CURRENT-MESSAGE PROTECTION
    # =====================================================

    if (
        not is_entity_only
        and not is_phrase_follow_up
    ):

        current_entity_keys = set(
            current_entities.keys()
        )

        protected_entity_keys = {
            "order_id",
            "customer_id",
            "ticket_id",
            "restaurant_id",
            "outlet_id",
            "menu_id",
            "printer_id",
            "kds_id",
            "account_id",
        }

        for key in protected_entity_keys:

            if (
                key not in current_entity_keys
                and key in merged_entities
            ):

                merged_entities.pop(
                    key,
                    None,
                )

    # =====================================================
    # FINAL INTENT PROTECTION
    # =====================================================

    if explicit_payment:

        resolved_intent = "payment_issue"
        resolved_confidence = 0.95

    elif explicit_refund:

        resolved_intent = "refund_issue"
        resolved_confidence = 0.95

    elif explicit_menu:

        resolved_intent = "menu_issue"
        resolved_confidence = max(
            0.80,
            current_confidence,
        )

    elif explicit_printer:

        resolved_intent = "printer_issue"
        resolved_confidence = max(
            0.85,
            current_confidence,
        )

    elif explicit_kds:

        resolved_intent = "kds_issue"
        resolved_confidence = max(
            0.85,
            current_confidence,
        )

    elif explicit_account:

        resolved_intent = "account_issue"
        resolved_confidence = max(
            0.80,
            current_confidence,
        )

    elif (
        has_order_id
        and explicit_order
    ):

        resolved_intent = "order_issue"
        resolved_confidence = max(
            0.95,
            current_confidence,
        )

    # =====================================================
    # SAVE STATE
    # =====================================================

    state["intent"] = resolved_intent

    state["confidence"] = resolved_confidence

    state["entities"] = merged_entities

    # -----------------------------------------------------
    # Store contextual information for downstream nodes.
    # This is especially useful for delivery-delay
    # follow-ups.
    # -----------------------------------------------------

    if context_type:
        state["context_type"] = context_type
    else:
        state.pop(
            "context_type",
            None,
        )

    return state