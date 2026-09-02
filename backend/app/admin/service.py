from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from backend.app.database.mongodb import mongodb


VALID_ROLES = {
    "admin",
    "support_agent",
    "viewer",
}

VALID_STATUSES = {
    "active",
    "inactive",
}


def get_database():
    if mongodb.database is None:
        raise RuntimeError("Database connection is not available.")

    return mongodb.database


def users_collection():
    return get_database()["users"]


def audit_collection():
    return get_database()["audit_logs"]


def settings_collection():
    return get_database()["system_settings"]


def serialize_user(user: dict[str, Any]) -> dict[str, Any]:
    user_id = (
        user.get("user_id")
        or user.get("id")
        or user.get("account_id")
        or user.get("_id")
    )

    return {
        "id": str(user_id),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "viewer"),
        "status": user.get("status", "active"),
    }


def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
):
    collection = users_collection()

    query: dict[str, Any] = {}

    if search:
        query["$or"] = [
            {
                "name": {
                    "$regex": search,
                    "$options": "i",
                }
            },
            {
                "email": {
                    "$regex": search,
                    "$options": "i",
                }
            },
            {
                "user_id": {
                    "$regex": search,
                    "$options": "i",
                }
            },
        ]

    if role:
        query["role"] = role

    if status:
        query["status"] = status

    users = list(
        collection.find(
            query,
            {
                "password_hash": 0,
            },
        ).sort("created_at", -1)
    )

    return [serialize_user(user) for user in users]


def create_admin_user(
    name: str,
    email: str,
    password_hash: str,
    role: str,
):
    if role not in VALID_ROLES:
        raise ValueError("Invalid user role.")

    normalized_email = email.strip().lower()

    collection = users_collection()

    existing = collection.find_one(
        {
            "email": normalized_email,
        }
    )

    if existing:
        raise ValueError(
            "An account with this email already exists."
        )

    now = datetime.now(timezone.utc)

    user_id = f"USR-{uuid4().hex[:10].upper()}"

    document = {
        "user_id": user_id,
        "name": name.strip(),
        "email": normalized_email,
        "password_hash": password_hash,
        "role": role,
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }

    collection.insert_one(document)

    created = collection.find_one(
        {
            "user_id": user_id,
        }
    )

    return serialize_user(created)


def update_user(
    user_id: str,
    name: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
):
    collection = users_collection()

    update_data: dict[str, Any] = {}

    if name is not None:
        update_data["name"] = name.strip()

    if role is not None:
        if role not in VALID_ROLES:
            raise ValueError("Invalid user role.")

        update_data["role"] = role

    if status is not None:
        if status not in VALID_STATUSES:
            raise ValueError("Invalid user status.")

        update_data["status"] = status

    if not update_data:
        raise ValueError("No changes were provided.")

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = collection.update_one(
        {
            "user_id": user_id,
        },
        {
            "$set": update_data,
        },
    )

    if result.matched_count == 0:
        return None

    updated = collection.find_one(
        {
            "user_id": user_id,
        },
        {
            "password_hash": 0,
        },
    )

    return serialize_user(updated)


def delete_user(user_id: str):
    collection = users_collection()

    user = collection.find_one(
        {
            "user_id": user_id,
        }
    )

    if not user:
        return None

    collection.delete_one(
        {
            "user_id": user_id,
        }
    )

    return serialize_user(user)


def create_audit_event(
    user_id: str,
    user_email: str,
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    severity: str = "info",
    details: Optional[dict[str, Any]] = None,
):
    event = {
        "event_id": f"AUD-{uuid4().hex[:12].upper()}",
        "user_id": str(user_id),
        "user_email": user_email,
        "action": action,
        "resource": resource,
        "resource_id": resource_id,
        "severity": severity,
        "details": details or {},
        "created_at": datetime.now(timezone.utc),
    }

    audit_collection().insert_one(event)

    return event


def list_audit_events(
    search: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100,
):
    collection = audit_collection()

    query: dict[str, Any] = {}

    if severity:
        query["severity"] = severity

    if search:
        query["$or"] = [
            {
                "user_email": {
                    "$regex": search,
                    "$options": "i",
                }
            },
            {
                "action": {
                    "$regex": search,
                    "$options": "i",
                }
            },
            {
                "resource": {
                    "$regex": search,
                    "$options": "i",
                }
            },
        ]

    events = list(
        collection.find(query)
        .sort("created_at", -1)
        .limit(limit)
    )

    serialized = []

    for event in events:
        serialized.append(
            {
                "id": str(
                    event.get("event_id")
                    or event.get("_id")
                ),
                "user_id": str(event.get("user_id", "")),
                "user_email": event.get("user_email", ""),
                "action": event.get("action", ""),
                "resource": event.get("resource", ""),
                "resource_id": event.get("resource_id"),
                "severity": event.get("severity", "info"),
                "details": event.get("details", {}),
                "created_at": event.get("created_at"),
            }
        )

    return serialized


def get_system_settings():
    document = settings_collection().find_one(
        {
            "key": "global",
        }
    )

    if not document:
        default_settings = {
            "ai_support_agent": True,
            "automatic_classification": True,
            "automatic_resolution": True,
            "human_handoff": True,
            "ai_confidence_threshold": 0.75,
            "automatic_escalation": True,
            "escalation_time_minutes": 30,
            "ticket_sla_hours": 24,
            "email_notifications": True,
            "browser_notifications": True,
            "approval_notifications": True,
            "audit_logging": True,
            "session_timeout_minutes": 60,
            "maximum_login_attempts": 5,
        }

        settings_collection().insert_one(
            {
                "key": "global",
                "settings": default_settings,
                "updated_at": datetime.now(timezone.utc),
            }
        )

        return default_settings

    return document.get("settings", {})


def update_system_settings(
    settings: dict[str, Any],
):
    settings_collection().update_one(
        {
            "key": "global",
        },
        {
            "$set": {
                "settings": settings,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        upsert=True,
    )

    return settings