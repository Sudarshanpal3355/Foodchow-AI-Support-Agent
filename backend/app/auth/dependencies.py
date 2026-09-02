from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from backend.app.auth.service import (
    decode_access_token,
    find_user_by_id,
    serialize_user,
)

from backend.app.guardrails.permissions import (
    normalize_role,
    is_valid_role,
)


bearer_scheme = HTTPBearer(auto_error=False)


# ============================================================
# CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
):
    """
    Validate the Bearer JWT and retrieve the current user.
    """

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    token = credentials.credentials

    # --------------------------------------------------------
    # DECODE JWT
    # --------------------------------------------------------

    try:
        payload = decode_access_token(token)

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    # --------------------------------------------------------
    # GET USER ID
    # --------------------------------------------------------

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = find_user_by_id(
        str(user_id)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={
                "WWW-Authenticate": "Bearer",
            },
        )

    # --------------------------------------------------------
    # ACCOUNT STATUS
    # --------------------------------------------------------

    if user.get(
        "status",
        "active",
    ) != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active.",
        )

    # --------------------------------------------------------
    # ROLE VALIDATION
    # --------------------------------------------------------

    user_role = normalize_role(
        user.get("role", "")
    )

    if not is_valid_role(user_role):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has an invalid role.",
        )

    # --------------------------------------------------------
    # RETURN SAFE USER
    # --------------------------------------------------------

    return serialize_user(user)


# ============================================================
# ROLE CHECK
# ============================================================

def require_roles(
    *allowed_roles: str,
) -> Callable:
    """
    Create a FastAPI dependency that allows only
    the specified roles.
    """

    normalized_roles = {
        normalize_role(role)
        for role in allowed_roles
    }

    def role_checker(
        current_user=Depends(
            get_current_user
        ),
    ):
        user_role = normalize_role(
            current_user.get(
                "role",
                "",
            )
        )

        if user_role not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You do not have permission "
                    "to perform this action."
                ),
            )

        return current_user

    return role_checker


# ============================================================
# ADMIN
# ============================================================

require_admin = require_roles(
    "admin"
)


# ============================================================
# SUPPORT AGENT
# ============================================================

require_support_agent = require_roles(
    "admin",
    "support_agent",
)


# ============================================================
# AUTHENTICATED USER
# ============================================================

require_authenticated = require_roles(
    "admin",
    "support_agent",
    "viewer",
)