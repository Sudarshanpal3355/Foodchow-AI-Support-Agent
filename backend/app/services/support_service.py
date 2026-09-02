from datetime import datetime, timezone
from uuid import uuid4

from backend.app.database.mongodb import mongodb


# =========================================================
# HELPER
# =========================================================

def _now():
    """
    Return the current UTC timestamp as an ISO string.
    """
    return datetime.now(timezone.utc).isoformat()


# =========================================================
# TICKETS
# =========================================================

def get_tickets():
    """
    Get all support tickets.
    """

    if mongodb.database is None:
        return []

    return list(
        mongodb.database["tickets"].find(
            {},
            {
                "_id": 0,
            },
        )
    )


def get_ticket(ticket_id: str):
    """
    Get a single support ticket.
    """

    if mongodb.database is None:
        return None

    return mongodb.database["tickets"].find_one(
        {
            "ticket_id": ticket_id,
        },
        {
            "_id": 0,
        },
    )


def create_ticket(ticket_data: dict):
    """
    Create a new support ticket.
    """

    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB is not connected."
        )

    timestamp = _now()

    ticket = {
        "ticket_id": (
            f"TKT-{uuid4().hex[:8].upper()}"
        ),

        "customer_id": ticket_data.get(
            "customer_id"
        ),

        "order_id": ticket_data.get(
            "order_id"
        ),

        "restaurant_id": ticket_data.get(
            "restaurant_id"
        ),

        "outlet_id": ticket_data.get(
            "outlet_id"
        ),

        "issue": ticket_data.get(
            "issue"
        ),

        "priority": ticket_data.get(
            "priority",
            "medium",
        ),

        "status": ticket_data.get(
            "status",
            "open",
        ),

        "created_at": timestamp,

        "updated_at": timestamp,
    }

    mongodb.database[
        "tickets"
    ].insert_one(ticket)

    ticket.pop(
        "_id",
        None,
    )

    return ticket


def update_ticket(
    ticket_id: str,
    update_data: dict,
):
    """
    Update an existing support ticket.
    """

    if mongodb.database is None:
        return None

    update_data = dict(
        update_data
    )

    update_data["updated_at"] = _now()

    result = mongodb.database[
        "tickets"
    ].update_one(
        {
            "ticket_id": ticket_id,
        },
        {
            "$set": update_data,
        },
    )

    if result.matched_count == 0:
        return None

    return get_ticket(
        ticket_id
    )


# =========================================================
# CONVERSATIONS
# =========================================================

def get_conversations():
    """
    Get all conversations.
    """

    if mongodb.database is None:
        return []

    return list(
        mongodb.database[
            "conversations"
        ].find(
            {},
            {
                "_id": 0,
            },
        ).sort(
            "updated_at",
            -1,
        )
    )


def get_conversation(
    conversation_id: str,
):
    """
    Get a single conversation.
    """

    if mongodb.database is None:
        return None

    return mongodb.database[
        "conversations"
    ].find_one(
        {
            "conversation_id":
                conversation_id,
        },
        {
            "_id": 0,
        },
    )


def create_conversation(
    customer_id: str | None = None,
):
    """
    Create a new conversation.
    """

    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB is not connected."
        )

    timestamp = _now()

    conversation = {
        "conversation_id": (
            f"CONV-{uuid4().hex[:8].upper()}"
        ),

        "customer_id": customer_id,

        "messages": [],

        "status": "active",

        "created_at": timestamp,

        "updated_at": timestamp,
    }

    mongodb.database[
        "conversations"
    ].insert_one(
        conversation
    )

    conversation.pop(
        "_id",
        None,
    )

    return conversation


# =========================================================
# ADD MESSAGE TO CONVERSATION
# =========================================================

def add_message_to_conversation(
    conversation_id: str,
    role: str,
    content: str,
    intent: str | None = None,
    confidence: float | None = None,
    requires_escalation: bool = False,
    ticket_id: str | None = None,
    tools_used: list[str] | None = None,
    activity: list[dict] | None = None,
):
    """
    Add a message to an existing conversation.

    For assistant messages, store safe AI metadata:

        - intent
        - confidence
        - requires_escalation
        - ticket_id
        - tools_used
        - activity

    IMPORTANT:

    Activity contains only safe operational information.

    Hidden chain-of-thought reasoning is NOT stored.
    """

    if mongodb.database is None:
        raise RuntimeError(
            "MongoDB is not connected."
        )

    # =====================================================
    # BASE MESSAGE
    # =====================================================

    message = {
        "message_id": (
            f"MSG-{uuid4().hex[:8].upper()}"
        ),

        "role": role,

        "content": content,

        "timestamp": _now(),
    }

    # =====================================================
    # ASSISTANT METADATA
    # =====================================================

    if role == "assistant":

        # -------------------------------------------------
        # Intent
        # -------------------------------------------------

        message["intent"] = intent

        # -------------------------------------------------
        # Confidence
        # -------------------------------------------------

        message["confidence"] = confidence

        # -------------------------------------------------
        # Escalation
        # -------------------------------------------------

        message[
            "requires_escalation"
        ] = requires_escalation

        # -------------------------------------------------
        # Ticket ID
        # -------------------------------------------------

        message["ticket_id"] = ticket_id

        # -------------------------------------------------
        # Tools used
        # -------------------------------------------------

        message["tools_used"] = (
            tools_used
            if tools_used is not None
            else []
        )

        # -------------------------------------------------
        # Safe operational activity
        # -------------------------------------------------

        message["activity"] = (
            activity
            if activity is not None
            else []
        )

    # =====================================================
    # SAVE MESSAGE
    # =====================================================

    result = mongodb.database[
        "conversations"
    ].update_one(
        {
            "conversation_id":
                conversation_id,
        },
        {
            "$push": {
                "messages": message,
            },

            "$set": {
                "updated_at": _now(),
            },
        },
    )

    # =====================================================
    # CONVERSATION NOT FOUND
    # =====================================================

    if result.matched_count == 0:
        return None

    return message


# =========================================================
# UPDATE CONVERSATION
# =========================================================

def update_conversation(
    conversation_id: str,
    update_data: dict,
):
    """
    Update conversation metadata.
    """

    if mongodb.database is None:
        return None

    update_data = dict(
        update_data
    )

    update_data["updated_at"] = _now()

    result = mongodb.database[
        "conversations"
    ].update_one(
        {
            "conversation_id":
                conversation_id,
        },
        {
            "$set": update_data,
        },
    )

    if result.matched_count == 0:
        return None

    return get_conversation(
        conversation_id
    )