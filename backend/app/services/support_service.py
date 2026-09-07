from datetime import datetime, timezone
from uuid import uuid4
import logging

from pymongo.errors import PyMongoError

from backend.app.database.mongodb import (
    mark_mongodb_unavailable,
    mongodb,
)


logger = logging.getLogger(__name__)

_memory_conversations: dict[str, dict] = {}


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
        return sorted(
            _memory_conversations.values(),
            key=lambda item: item.get("updated_at", ""),
            reverse=True,
        )

    try:
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
    except PyMongoError as exc:
        logger.warning(
            "MongoDB unavailable while loading conversations: %s",
            exc,
        )
        mark_mongodb_unavailable()
        return []


def get_conversation(
    conversation_id: str,
):
    """
    Get a single conversation.
    """

    if mongodb.database is None:
        return _memory_conversations.get(conversation_id)

    try:
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
    except PyMongoError as exc:
        logger.warning(
            "MongoDB unavailable while loading conversation: %s",
            exc,
        )
        mark_mongodb_unavailable()
        return _memory_conversations.get(conversation_id)


def create_conversation(
    customer_id: str | None = None,
):
    """
    Create a new conversation.
    """

    if mongodb.database is None:
        conversation = _new_conversation(customer_id)
        _memory_conversations[conversation["conversation_id"]] = conversation
        return conversation

    conversation = _new_conversation(customer_id)

    try:
        mongodb.database["conversations"].insert_one(conversation)
    except PyMongoError as exc:
        logger.warning("MongoDB unavailable while creating conversation: %s", exc)
        mark_mongodb_unavailable()
        _memory_conversations[conversation["conversation_id"]] = conversation
        return conversation

    conversation.pop(
        "_id",
        None,
    )

    return conversation


def _new_conversation(customer_id: str | None = None) -> dict:
    timestamp = _now()
    return {
        "conversation_id": f"CONV-{uuid4().hex[:8].upper()}",
        "customer_id": customer_id,
        "messages": [],
        "status": "active",
        "created_at": timestamp,
        "updated_at": timestamp,
    }


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
        conversation = _memory_conversations.get(conversation_id)
        if conversation is None:
            return None
        message = _new_message(
            role,
            content,
            intent,
            confidence,
            requires_escalation,
            ticket_id,
            tools_used,
            activity,
        )
        conversation["messages"].append(message)
        conversation["updated_at"] = _now()
        return message

    # =====================================================
    # BASE MESSAGE
    # =====================================================

    message = _new_message(
        role,
        content,
        intent,
        confidence,
        requires_escalation,
        ticket_id,
        tools_used,
        activity,
    )

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

    try:
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
    except PyMongoError as exc:
        logger.warning(
            "MongoDB unavailable while saving conversation message: %s",
            exc,
        )
        mark_mongodb_unavailable()
        conversation = _memory_conversations.setdefault(
            conversation_id,
            {
                "conversation_id": conversation_id,
                "customer_id": None,
                "messages": [],
                "status": "active",
                "created_at": _now(),
                "updated_at": _now(),
            },
        )
        conversation["messages"].append(message)
        conversation["updated_at"] = _now()
        return message

    # =====================================================
    # CONVERSATION NOT FOUND
    # =====================================================

    if result.matched_count == 0:
        return None

    return message


def _new_message(
    role: str,
    content: str,
    intent: str | None,
    confidence: float | None,
    requires_escalation: bool,
    ticket_id: str | None,
    tools_used: list[str] | None,
    activity: list[dict] | None,
) -> dict:
    message = {
        "message_id": f"MSG-{uuid4().hex[:8].upper()}",
        "role": role,
        "content": content,
        "timestamp": _now(),
    }
    if role == "assistant":
        message.update({
            "intent": intent,
            "confidence": confidence,
            "requires_escalation": requires_escalation,
            "ticket_id": ticket_id,
            "tools_used": tools_used or [],
            "activity": activity or [],
        })
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