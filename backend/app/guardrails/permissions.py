from typing import Final


# ============================================================
# ROLE DEFINITIONS
# ============================================================

ADMIN_ROLE: Final[str] = "admin"
SUPPORT_AGENT_ROLE: Final[str] = "support_agent"
VIEWER_ROLE: Final[str] = "viewer"


VALID_ROLES: Final[set[str]] = {
    ADMIN_ROLE,
    SUPPORT_AGENT_ROLE,
    VIEWER_ROLE,
}


# ============================================================
# PERMISSION DEFINITIONS
# ============================================================

ROLE_PERMISSIONS: Final[dict[str, set[str]]] = {
    ADMIN_ROLE: {
        "dashboard_view",
        "support_chat",
        "diagnostics",
        "conversation_view",
        "ticket_view",
        "ticket_manage",
        "knowledge_view",
        "knowledge_manage",
        "analytics_view",
        "settings_view",
        "human_handoff",
        "user_management",
        "approval_management",
    },

    SUPPORT_AGENT_ROLE: {
        "dashboard_view",
        "support_chat",
        "diagnostics",
        "conversation_view",
        "ticket_view",
        "ticket_manage",
        "knowledge_view",
        "analytics_view",
        "settings_view",
        "human_handoff",
    },

    VIEWER_ROLE: {
        "dashboard_view",
        "conversation_view",
        "ticket_view",
        "knowledge_view",
        "analytics_view",
        "settings_view",
    },
}


# ============================================================
# ROLE NORMALIZATION
# ============================================================

def normalize_role(role: str) -> str:
    """
    Normalize a role before permission checking.
    """

    return (
        str(role or "")
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )


# ============================================================
# ROLE VALIDATION
# ============================================================

def is_valid_role(role: str) -> bool:
    """
    Check whether the supplied role is supported.
    """

    return normalize_role(role) in VALID_ROLES


# ============================================================
# PERMISSION CHECKING
# ============================================================

def has_permission(
    role: str,
    permission: str,
) -> bool:
    """
    Check whether a role has a specific permission.
    """

    normalized_role = normalize_role(role)

    if normalized_role not in VALID_ROLES:
        return False

    return permission in ROLE_PERMISSIONS.get(
        normalized_role,
        set(),
    )


# ============================================================
# REQUIRE PERMISSION
# ============================================================

def require_permission(
    role: str,
    permission: str,
) -> None:
    """
    Raise PermissionError when the role does not have
    the requested permission.
    """

    if not has_permission(
        role,
        permission,
    ):
        raise PermissionError(
            f"Role '{normalize_role(role)}' does not have "
            f"permission '{permission}'."
        )


# ============================================================
# ROLE HELPERS
# ============================================================

def is_admin(role: str) -> bool:
    """
    Check whether the role is administrator.
    """

    return normalize_role(role) == ADMIN_ROLE


def is_support_agent(role: str) -> bool:
    """
    Check whether the role is a support agent.
    """

    return normalize_role(role) in {
        ADMIN_ROLE,
        SUPPORT_AGENT_ROLE,
    }


def is_viewer(role: str) -> bool:
    """
    Check whether the role is viewer.
    """

    return normalize_role(role) == VIEWER_ROLE