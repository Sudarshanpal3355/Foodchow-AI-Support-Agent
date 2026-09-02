import re


# =========================================================
# INTENT KEYWORDS
# =========================================================

INTENT_KEYWORDS = {

    "order_issue": [
        "order",
        "order status",
        "track order",
        "tracking",
        "where is my order",
        "order confirmation",
        "order confirmed",
        "order pending",
        "pending order",
        "order delayed",
        "delayed order",
        "late order",
        "delivery",
        "deliver",
        "delivered",
        "arrive",
        "arrived",
        "pickup",
        "cancel order",
        "cancelled order",
        "canceled order",
    ],

    "payment_issue": [
        "payment",
        "payment status",
        "payment failed",
        "payment failure",
        "payment pending",
        "payment successful",
        "payment success",
        "payment declined",
        "payment not accepted",
        "payment rejected",
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
    ],

    "refund_issue": [
        "refund",
        "refund status",
        "refund pending",
        "refund failed",
        "refund failure",
        "refund not received",
        "refunded",
        "money back",
        "money has not been refunded",
    ],

    "menu_issue": [
        "menu",
        "menus",
        "food menu",
        "food item",
        "food items",
        "what is on the menu",
        "what's on the menu",
        "what is on menu",
        "what's on menu",
        "show me the menu",
        "show menu",
        "what food do you have",
        "what dishes do you have",
        "available dishes",
        "available food",
    ],

    "printer_issue": [
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
    ],

    "kds_issue": [
        # -------------------------------------------------
        # KDS
        # -------------------------------------------------
        "kds",
        "kds status",
        "kds problem",
        "kds issue",
        "kds error",
        "kds offline",
        "kds online",
        "kds not working",
        "check kds",
        "check the kds",

        # -------------------------------------------------
        # KITCHEN DISPLAY
        # -------------------------------------------------
        "kitchen display",
        "kitchen display system",
        "kitchen display issue",
        "kitchen display problem",
        "kitchen display not working",
        "kitchen display isn't working",
        "kitchen display is not working",

        # -------------------------------------------------
        # KITCHEN SCREEN
        # -------------------------------------------------
        "kitchen screen",
        "kitchen screen issue",
        "kitchen screen problem",
        "kitchen screen not working",
        "kitchen screen isn't working",
        "kitchen screen is not working",
        "kitchen screen offline",
        "kitchen screen disconnected",
        "kitchen screen is offline",
        "kitchen screen is disconnected",

        # -------------------------------------------------
        # ORDERS NOT REACHING KDS
        # -------------------------------------------------
        "orders not appearing on kitchen screen",
        "orders are not appearing on kitchen screen",
        "order not appearing on kitchen screen",
        "order is not appearing on kitchen screen",

        "orders not showing on kitchen screen",
        "orders are not showing on kitchen screen",
        "order not showing on kitchen screen",
        "order is not showing on kitchen screen",

        "orders missing from kitchen screen",
        "order missing from kitchen screen",

        "orders not appearing on kds",
        "orders are not appearing on kds",
        "order not appearing on kds",
        "order is not appearing on kds",

        "orders not showing on kds",
        "orders are not showing on kds",
        "order not showing on kds",
        "order is not showing on kds",

        "orders missing from kds",
        "order missing from kds",

        "kitchen orders not appearing",
        "kitchen orders not showing",
        "kitchen orders missing",

        # -------------------------------------------------
        # KITCHEN ORDER FLOW
        # -------------------------------------------------
        "orders not reaching kitchen",
        "orders are not reaching kitchen",
        "order not reaching kitchen",
        "order is not reaching kitchen",
        "orders not received by kitchen",
        "orders are not received by kitchen",
        "order not received by kitchen",
        "order is not received by kitchen",
        "orders not visible on kitchen screen",
        "orders are not visible on kitchen screen",
        "order not visible on kitchen screen",
        "order is not visible on kitchen screen",
    ],

    "account_issue": [
        "account",
        "account issue",
        "account problem",
        "account error",
        "login",
        "log in",
        "signin",
        "sign in",
        "can't login",
        "cannot login",
        "unable to login",
        "unable to log in",
        "password",
        "forgot password",
        "account locked",
        "locked account",
        "account active",
        "account inactive",
    ],

    "restaurant_issue": [
        "restaurant",
        "restaurant issue",
        "restaurant problem",
        "restaurant status",
        "restaurant details",
    ],

    "outlet_issue": [
        "outlet",
        "outlet issue",
        "outlet problem",
        "outlet status",
        "outlet details",
    ],

    "ticket_issue": [
        "ticket",
        "support ticket",
        "ticket status",
        "ticket number",
        "ticket id",
    ],

    "general_support": [],
}


# =========================================================
# INTENT PRIORITY
# =========================================================

INTENT_PRIORITY = [
    "payment_issue",
    "refund_issue",
    "printer_issue",
    "kds_issue",
    "menu_issue",
    "account_issue",
    "order_issue",
    "ticket_issue",
    "outlet_issue",
    "restaurant_issue",
    "general_support",
]


# =========================================================
# ENTITY PATTERNS
# =========================================================

ENTITY_PATTERNS = {

    "order_id": r"\bORD-?\d+\b",

    "customer_id": r"\bCUS\d+\b",

    "ticket_id": r"\bTKT(?:\d+|-[A-F0-9]+)\b",

    "restaurant_id": r"\bREST\d+\b",

    "outlet_id": r"\bOUT\d+\b",

    "menu_id": r"\bMENU\d+\b",

    "printer_id": r"\bPRN\d+\b",

    "kds_id": r"\bKDS\d+\b",

    "account_id": r"\bACC\d+\b",
}


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
# NORMALIZE TEXT
# =========================================================

def _normalize_text(
    text: str | None,
) -> str:

    if not text:
        return ""

    text = str(text)

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip().lower()


# =========================================================
# NORMALIZE ORDER ID
# =========================================================

def normalize_order_id(
    order_id: str | None,
) -> str | None:
    """
    Normalize FoodChow order IDs.

    Examples:

        ORD1001  -> ORD1001
        ORD-1001 -> ORD1001
    """

    if not order_id:
        return None

    normalized = str(
        order_id
    ).strip().upper()

    if re.fullmatch(
        r"ORD-?\d+",
        normalized,
    ):
        return normalized.replace(
            "-",
            "",
        )

    return normalized


# =========================================================
# DETECT FOLLOW-UP
# =========================================================

def _is_follow_up_message(
    message: str,
) -> bool:

    normalized = _normalize_text(
        message
    )

    if not normalized:
        return False

    return any(
        phrase in normalized
        for phrase in FOLLOW_UP_PHRASES
    )


# =========================================================
# DETECT DELIVERY / DELAY QUESTION
# =========================================================

def _is_delivery_delay_question(
    message: str,
) -> bool:

    normalized = _normalize_text(
        message
    )

    if not normalized:
        return False

    return any(
        phrase in normalized
        for phrase in DELIVERY_DELAY_PHRASES
    )


# =========================================================
# DETECT INTENT
# =========================================================

def detect_intent(
    message: str,
) -> dict:
    """
    Detect the intent of the CURRENT customer message.

    Explicit payment/refund signals have priority over
    generic order-related language.

    KDS and printer signals are checked before generic
    order signals because operational device problems
    can contain words such as "order".
    """

    text = _normalize_text(
        message
    )

    if not text:
        return {
            "intent": "general_support",
            "confidence": 0.0,
        }

    # =====================================================
    # PAYMENT PRIORITY
    # =====================================================

    payment_signals = [
        "payment",
        "payment status",
        "payment failed",
        "payment failure",
        "payment pending",
        "payment successful",
        "payment success",
        "payment declined",
        "payment not accepted",
        "payment rejected",
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

    if any(
        phrase in text
        for phrase in payment_signals
    ):
        return {
            "intent": "payment_issue",
            "confidence": 0.95,
        }

    # =====================================================
    # REFUND PRIORITY
    # =====================================================

    refund_signals = [
        "refund",
        "refund status",
        "refund pending",
        "refund failed",
        "refund failure",
        "refund not received",
        "refunded",
        "money back",
        "money has not been refunded",
    ]

    if any(
        phrase in text
        for phrase in refund_signals
    ):
        return {
            "intent": "refund_issue",
            "confidence": 0.95,
        }

    # =====================================================
    # PRINTER
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["printer_issue"]
    ):
        return {
            "intent": "printer_issue",
            "confidence": 0.85,
        }

    if re.search(
        ENTITY_PATTERNS["printer_id"],
        message or "",
        re.IGNORECASE,
    ):
        return {
            "intent": "printer_issue",
            "confidence": 0.85,
        }

    # =====================================================
    # KDS
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["kds_issue"]
    ):
        return {
            "intent": "kds_issue",
            "confidence": 0.90,
        }

    if re.search(
        ENTITY_PATTERNS["kds_id"],
        message or "",
        re.IGNORECASE,
    ):
        return {
            "intent": "kds_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # MENU
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["menu_issue"]
    ):
        return {
            "intent": "menu_issue",
            "confidence": 0.80,
        }

    # =====================================================
    # ACCOUNT
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["account_issue"]
    ):
        return {
            "intent": "account_issue",
            "confidence": 0.80,
        }

    if re.search(
        ENTITY_PATTERNS["account_id"],
        message or "",
        re.IGNORECASE,
    ):
        return {
            "intent": "account_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # ORDER
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["order_issue"]
    ):
        return {
            "intent": "order_issue",
            "confidence": 0.90,
        }

    if re.search(
        ENTITY_PATTERNS["order_id"],
        message or "",
        re.IGNORECASE,
    ):
        return {
            "intent": "order_issue",
            "confidence": 0.95,
        }

    # =====================================================
    # TICKET
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["ticket_issue"]
    ):
        return {
            "intent": "ticket_issue",
            "confidence": 0.85,
        }

    if re.search(
        ENTITY_PATTERNS["ticket_id"],
        message or "",
        re.IGNORECASE,
    ):
        return {
            "intent": "ticket_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # OUTLET
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["outlet_issue"]
    ):
        return {
            "intent": "outlet_issue",
            "confidence": 0.80,
        }

    # =====================================================
    # RESTAURANT
    # =====================================================

    if any(
        phrase in text
        for phrase in INTENT_KEYWORDS["restaurant_issue"]
    ):
        return {
            "intent": "restaurant_issue",
            "confidence": 0.80,
        }

    # =====================================================
    # GENERAL
    # =====================================================

    return {
        "intent": "general_support",
        "confidence": 0.50,
    }


# =========================================================
# EXTRACT ENTITIES
# =========================================================

def extract_entities(
    message: str,
) -> dict:
    """
    Extract all supported FoodChow identifiers.
    """

    entities = {}

    if not message:
        return entities

    for entity_name, pattern in ENTITY_PATTERNS.items():

        match = re.search(
            pattern,
            message,
            re.IGNORECASE,
        )

        if not match:
            continue

        value = match.group(0).upper()

        if entity_name == "order_id":
            value = normalize_order_id(
                value
            )

        entities[entity_name] = value

    return entities


# =========================================================
# GET LATEST CUSTOMER MESSAGE
# =========================================================

def _get_latest_customer_message(
    conversation_context: str,
) -> str | None:
    """
    Return the newest CUSTOMER message only.

    Assistant responses are intentionally ignored.
    """

    if not conversation_context:
        return None

    lines = re.split(
        r"\r?\n",
        conversation_context,
    )

    for line in reversed(lines):

        line = line.strip()

        if not line:
            continue

        if not line.lower().startswith(
            "customer:"
        ):
            continue

        customer_message = re.sub(
            r"^\s*customer:\s*",
            "",
            line,
            flags=re.IGNORECASE,
        ).strip()

        if customer_message:
            return customer_message

    return None


# =========================================================
# GET LATEST OPERATIONAL CONTEXT
# =========================================================

def _get_latest_operational_context(
    conversation_context: str,
) -> tuple[str | None, dict]:
    """
    Find the newest CUSTOMER turn containing a useful
    operational entity.

    The newest relevant customer turn wins.
    """

    if not conversation_context:
        return None, {}

    lines = re.split(
        r"\r?\n",
        conversation_context,
    )

    for line in reversed(lines):

        line = line.strip()

        if not line:
            continue

        if not line.lower().startswith(
            "customer:"
        ):
            continue

        customer_message = re.sub(
            r"^\s*customer:\s*",
            "",
            line,
            flags=re.IGNORECASE,
        ).strip()

        if not customer_message:
            continue

        entities = extract_entities(
            customer_message
        )

        if not isinstance(
            entities,
            dict,
        ):
            entities = {}

        if entities:

            previous_intent = detect_intent(
                customer_message
            )

            return (
                previous_intent.get(
                    "intent",
                    "general_support",
                ),
                entities,
            )

    return None, {}


# =========================================================
# CONTEXTUAL INTENT
# =========================================================

def resolve_contextual_intent(
    current_intent: str,
    current_confidence: float,
    current_message: str,
    current_entities: dict,
    conversation_context: str,
) -> dict:
    """
    Resolve contextual follow-up intent.

    Explicit current-message entities always win.

    Follow-up messages use the latest customer
    operational context.

    Delivery-delay questions keep the existing
    order_issue intent but receive a context_type of
    delivery_delay so downstream logic can distinguish
    them from a normal order-status request.
    """

    current_message = (
        current_message or ""
    ).strip()

    if not isinstance(
        current_entities,
        dict,
    ):
        current_entities = {}

    # =====================================================
    # EMPTY MESSAGE
    # =====================================================

    if not current_message:
        return {
            "intent": current_intent,
            "confidence": current_confidence,
        }

    normalized = _normalize_text(
        current_message
    )

    # =====================================================
    # EXPLICIT CURRENT-MESSAGE INTENT
    # =====================================================
    #
    # If the customer explicitly mentions a device,
    # payment, refund, account, etc., respect the
    # CURRENT message instead of allowing old context
    # to override it.
    #
    # This is especially important for:
    #
    #   "Orders are not appearing on my kitchen screen"
    #
    # which must remain a KDS issue even if the previous
    # conversation was about an order.
    # =====================================================

    if not current_entities:

        explicit_current = detect_intent(
            current_message
        )

        explicit_intent = explicit_current.get(
            "intent"
        )

        explicit_confidence = explicit_current.get(
            "confidence",
            0.0,
        )

        if explicit_intent not in {
            None,
            "general_support",
        }:
            return {
                "intent": explicit_intent,
                "confidence": explicit_confidence,
            }

    # =====================================================
    # CURRENT ENTITIES
    # =====================================================

    if current_entities:
        return {
            "intent": current_intent,
            "confidence": current_confidence,
        }

    # =====================================================
    # NOT FOLLOW-UP
    # =====================================================

    if not _is_follow_up_message(
        current_message
    ):
        return {
            "intent": current_intent,
            "confidence": current_confidence,
        }

    # =====================================================
    # NO CONTEXT
    # =====================================================

    if not conversation_context:
        return {
            "intent": current_intent,
            "confidence": current_confidence,
        }

    # =====================================================
    # LATEST OPERATIONAL CONTEXT
    # =====================================================

    previous_intent, previous_entities = (
        _get_latest_operational_context(
            conversation_context
        )
    )

    if not previous_entities:
        return {
            "intent": current_intent,
            "confidence": current_confidence,
        }

    # =====================================================
    # ACCOUNT
    # =====================================================

    if "account_id" in previous_entities:
        return {
            "intent": "account_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # PRINTER
    # =====================================================

    if "printer_id" in previous_entities:
        return {
            "intent": "printer_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # KDS
    # =====================================================

    if "kds_id" in previous_entities:
        return {
            "intent": "kds_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # MENU
    # =====================================================

    if "menu_id" in previous_entities:
        return {
            "intent": "menu_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # OUTLET
    # =====================================================

    if "outlet_id" in previous_entities:

        if previous_intent == "menu_issue":
            return {
                "intent": "menu_issue",
                "confidence": 0.90,
            }

        return {
            "intent": "outlet_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # ORDER
    # =====================================================

    if "order_id" in previous_entities:

        # -------------------------------------------------
        # DELIVERY / DELAY FOLLOW-UP
        # -------------------------------------------------

        if _is_delivery_delay_question(
            normalized
        ):
            return {
                "intent": "order_issue",
                "confidence": 0.95,
                "context_type": "delivery_delay",
            }

        # -------------------------------------------------
        # PAYMENT FOLLOW-UP
        # -------------------------------------------------

        if previous_intent == "payment_issue":
            return {
                "intent": "payment_issue",
                "confidence": 0.90,
            }

        # -------------------------------------------------
        # REFUND FOLLOW-UP
        # -------------------------------------------------

        if previous_intent == "refund_issue":
            return {
                "intent": "refund_issue",
                "confidence": 0.90,
            }

        # -------------------------------------------------
        # NORMAL ORDER FOLLOW-UP
        # -------------------------------------------------

        return {
            "intent": "order_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # RESTAURANT
    # =====================================================

    if "restaurant_id" in previous_entities:
        return {
            "intent": "restaurant_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # CUSTOMER
    # =====================================================

    if "customer_id" in previous_entities:

        if previous_intent in {
            "account_issue",
            "payment_issue",
            "refund_issue",
            "order_issue",
        }:
            return {
                "intent": previous_intent,
                "confidence": 0.85,
            }

    # =====================================================
    # TICKET
    # =====================================================

    if "ticket_id" in previous_entities:
        return {
            "intent": "ticket_issue",
            "confidence": 0.90,
        }

    # =====================================================
    # FALLBACK
    # =====================================================

    if previous_intent in {
        "order_issue",
        "payment_issue",
        "refund_issue",
        "menu_issue",
        "printer_issue",
        "kds_issue",
        "account_issue",
        "restaurant_issue",
        "outlet_issue",
        "ticket_issue",
    }:
        return {
            "intent": previous_intent,
            "confidence": 0.85,
        }

    return {
        "intent": current_intent,
        "confidence": current_confidence,
    }