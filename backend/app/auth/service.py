from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import bcrypt
import jwt

from backend.app.core.config import get_settings
from backend.app.database.mongodb import mongodb


settings = get_settings()


# ============================================================
# PASSWORD HANDLING
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    """
    password_bytes = password.encode("utf-8")

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    )

    return hashed.decode("utf-8")


def verify_password(
    password: str,
    password_hash: str,
) -> bool:
    """
    Verify a plain-text password against a bcrypt hash.
    """
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


# ============================================================
# JWT
# ============================================================

def _get_jwt_secret() -> str:
    """
    Obtain the JWT secret from application settings.

    The secret must be configured through the environment.
    """

    secret = getattr(
        settings,
        "JWT_SECRET_KEY",
        None,
    )

    if not secret:
        raise RuntimeError(
            "JWT secret is not configured. "
            "Add JWT_SECRET_KEY to the backend environment."
        )

    return secret


def create_access_token(
    user: dict[str, Any],
) -> str:
    """
    Create a JWT access token.

    The token contains only the information required
    for authentication and authorization.
    """

    now = datetime.now(timezone.utc)

    expiration_minutes = getattr(
        settings,
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        60,
    )

    user_id = (
        user.get("user_id")
        or user.get("id")
        or user.get("account_id")
        or user.get("_id")
    )

    payload = {
        "sub": str(user_id),
        "email": user.get("email", ""),
        "role": user.get("role", "viewer"),
        "iat": now,
        "exp": now + timedelta(
            minutes=expiration_minutes
        ),
    }

    return jwt.encode(
        payload,
        _get_jwt_secret(),
        algorithm="HS256",
    )


def decode_access_token(
    token: str,
) -> dict[str, Any]:
    """
    Decode and validate a JWT access token.
    """

    return jwt.decode(
        token,
        _get_jwt_secret(),
        algorithms=["HS256"],
    )


# ============================================================
# USER SERIALIZATION
# ============================================================

def serialize_user(
    user: dict[str, Any],
) -> dict[str, Any]:
    """
    Convert a MongoDB user document into a safe
    API response.

    Password hashes and other sensitive fields are
    intentionally excluded.
    """

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
        "role": user.get(
            "role",
            "viewer",
        ),
        "status": user.get(
            "status",
            "active",
        ),
    }


# ============================================================
# DATABASE
# ============================================================

def get_users_collection():
    """
    Return the MongoDB users collection.
    """

    if mongodb.database is None:
        raise RuntimeError(
            "Database connection is not available."
        )

    return mongodb.database["users"]


# ============================================================
# FIND USER BY EMAIL
# ============================================================

def find_user_by_email(
    email: str,
) -> Optional[dict]:
    """
    Find a user using their normalized email address.
    """

    collection = get_users_collection()

    normalized_email = (
        email.strip().lower()
    )

    return collection.find_one(
        {
            "email": normalized_email,
        }
    )


# ============================================================
# FIND USER BY ID
# ============================================================

def find_user_by_id(
    user_id: str,
) -> Optional[dict]:
    """
    Find an application user by their application-level ID.
    """

    collection = get_users_collection()

    return collection.find_one(
        {
            "$or": [
                {
                    "user_id": user_id
                },
                {
                    "account_id": user_id
                },
                {
                    "id": user_id
                },
            ]
        }
    )


# ============================================================
# CREATE USER
# ============================================================

def create_user(
    name: str,
    email: str,
    password: str,
    role: str = "support_agent",
) -> dict:
    """
    Create a new application user.

    Public signup is intentionally restricted to:
        - support_agent
        - viewer

    Admin accounts must be created through
    administrator-controlled functionality.
    """

    if role not in {
        "support_agent",
        "viewer",
    }:
        raise ValueError(
            "Public registration cannot create an admin account."
        )

    collection = get_users_collection()

    normalized_email = (
        email.strip().lower()
    )

    # --------------------------------------------------------
    # CHECK EXISTING USER
    # --------------------------------------------------------

    existing = collection.find_one(
        {
            "email": normalized_email,
        }
    )

    if existing:
        raise ValueError(
            "An account with this email already exists."
        )

    # --------------------------------------------------------
    # GENERATE APPLICATION USER ID
    # --------------------------------------------------------

    user_count = collection.count_documents({})

    user_id = f"USR{user_count + 1:04d}"

    # --------------------------------------------------------
    # CREATE DOCUMENT
    # --------------------------------------------------------

    now = datetime.now(timezone.utc)

    document = {
        "user_id": user_id,
        "name": name.strip(),
        "email": normalized_email,
        "password_hash": hash_password(password),
        "role": role,
        "status": "active",
        "created_at": now,
        "updated_at": now,
    }

    collection.insert_one(document)

    # --------------------------------------------------------
    # RETRIEVE CREATED USER
    # --------------------------------------------------------

    created_user = collection.find_one(
        {
            "user_id": user_id,
        }
    )

    if not created_user:
        raise RuntimeError(
            "User was created but could not be retrieved."
        )

    return serialize_user(
        created_user
    )


# ============================================================
# AUTHENTICATE USER
# ============================================================

def authenticate_user(
    email: str,
    password: str,
) -> Optional[dict]:
    """
    Authenticate a user using email and bcrypt password.
    """

    user = find_user_by_email(
        email
    )

    if not user:
        return None

    # --------------------------------------------------------
    # ACCOUNT STATUS
    # --------------------------------------------------------

    if user.get(
        "status",
        "active",
    ) != "active":
        return None

    # --------------------------------------------------------
    # PASSWORD HASH
    # --------------------------------------------------------

    password_hash = user.get(
        "password_hash"
    )

    if not password_hash:
        return None

    # --------------------------------------------------------
    # VERIFY PASSWORD
    # --------------------------------------------------------

    if not verify_password(
        password,
        password_hash,
    ):
        return None

    return user


def seed_demo_users():
    """
    Create demo accounts for interview/demo purposes if they do not exist.

    These accounts are created only when missing, so restarting the
    backend will not create duplicate users.
    """
    collection = get_users_collection()

    demo_users = [
        {
            "name": "FoodChow Administrator",
            "email": "admin@foodchow.com",
            "password": "DemoPassword123",
            "role": "admin",
        },
        {
            "name": "FoodChow Support Agent",
            "email": "agent@foodchow.com",
            "password": "DemoPassword123",
            "role": "support_agent",
        },
    ]

    for demo_user in demo_users:
        email = demo_user["email"].strip().lower()

        existing = collection.find_one({"email": email})

        if existing:
            continue

        now = datetime.now(timezone.utc)

        user_count = collection.count_documents({})
        user_id = f"USR{user_count + 1:04d}"

        document = {
            "user_id": user_id,
            "name": demo_user["name"],
            "email": email,
            "password_hash": hash_password(demo_user["password"]),
            "role": demo_user["role"],
            "status": "active",
            "created_at": now,
            "updated_at": now,
        }

        collection.insert_one(document)

        print(
            f"Demo {demo_user['role']} account created: {email}"
        )