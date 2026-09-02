from datetime import datetime, timezone
from time import perf_counter
from typing import Optional
from urllib.request import Request, urlopen
from urllib.error import URLError

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.app.auth.dependencies import (
    get_current_user,
    require_admin,
)
from backend.app.auth.service import hash_password

from backend.app.admin.schemas import (
    AdminUserCreate,
    AdminUserUpdate,
    AuditLogsResponse,
    IntegrationCheckResponse,
    SystemSettingsUpdate,
    SystemSettingsResponse,
)

from backend.app.admin.service import (
    create_admin_user,
    create_audit_event,
    delete_user,
    get_system_settings,
    list_audit_events,
    list_users,
    update_system_settings,
    update_user,
)


router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
)


# ============================================================
# USERS
# ============================================================

@router.get("/users")
def get_users(
    search: Optional[str] = Query(default=None),
    role: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
    ),
    current_user=Depends(get_current_user),
):
    """
    Authenticated users can view the user list.
    Actual user modifications remain Admin-only.
    """

    users = list_users(
        search=search,
        role=role,
        status=status_filter,
    )

    return {
        "users": users,
        "total": len(users),
    }


@router.post("/users")
def create_user(
    request: AdminUserCreate,
    current_user=Depends(require_admin),
):
    try:
        user = create_admin_user(
            name=request.name,
            email=request.email,
            password_hash=hash_password(
                request.password
            ),
            role=request.role,
        )

        create_audit_event(
            user_id=current_user["id"],
            user_email=current_user["email"],
            action="create_user",
            resource="user",
            resource_id=user["id"],
            details={
                "created_email": user["email"],
                "role": user["role"],
            },
        )

        return user

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.patch("/users/{user_id}")
def modify_user(
    user_id: str,
    request: AdminUserUpdate,
    current_user=Depends(require_admin),
):
    if (
        user_id == current_user["id"]
        and request.status == "inactive"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own account.",
        )

    try:
        user = update_user(
            user_id=user_id,
            name=request.name,
            role=request.role,
            status=request.status,
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found.",
            )

        create_audit_event(
            user_id=current_user["id"],
            user_email=current_user["email"],
            action="update_user",
            resource="user",
            resource_id=user_id,
            details=request.model_dump(
                exclude_none=True
            ),
        )

        return user

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


@router.delete("/users/{user_id}")
def remove_user(
    user_id: str,
    current_user=Depends(require_admin),
):
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    user = delete_user(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    create_audit_event(
        user_id=current_user["id"],
        user_email=current_user["email"],
        action="delete_user",
        resource="user",
        resource_id=user_id,
        severity="warning",
        details={
            "deleted_email": user["email"],
            "deleted_role": user["role"],
        },
    )

    return {
        "message": "User account deleted successfully.",
        "user": user,
    }


# ============================================================
# AUDIT LOGS
# ============================================================

@router.get(
    "/audit-logs",
    response_model=AuditLogsResponse,
)
def get_audit_logs(
    search: Optional[str] = Query(default=None),
    severity: Optional[str] = Query(default=None),
    limit: int = Query(
        default=100,
        ge=1,
        le=500,
    ),
    current_user=Depends(get_current_user),
):
    events = list_audit_events(
        search=search,
        severity=severity,
        limit=limit,
    )

    return {
        "events": events,
        "total": len(events),
    }


# ============================================================
# SYSTEM SETTINGS
# ============================================================

@router.get(
    "/settings",
    response_model=SystemSettingsResponse,
)
def get_settings(
    current_user=Depends(get_current_user),
):
    return {
        "settings": get_system_settings(),
    }


@router.put(
    "/settings",
    response_model=SystemSettingsResponse,
)
def save_settings(
    request: SystemSettingsUpdate,
    current_user=Depends(require_admin),
):
    updated = update_system_settings(
        request.settings
    )

    create_audit_event(
        user_id=current_user["id"],
        user_email=current_user["email"],
        action="update_settings",
        resource="system_settings",
        severity="warning",
        details={
            "updated_keys": list(
                request.settings.keys()
            )
        },
    )

    return {
        "settings": updated,
    }


# ============================================================
# INTEGRATION HEALTH CHECK
# ============================================================

@router.get(
    "/integrations/check/{integration_name}",
    response_model=IntegrationCheckResponse,
)
def check_integration(
    integration_name: str,
    current_user=Depends(get_current_user),
):
    """
    Performs a real HTTP health check when an integration
    health-check URL is configured.
    """

    settings = get_system_settings()

    integration_urls = settings.get(
        "integration_urls",
        {},
    )

    url = integration_urls.get(
        integration_name
    )

    started = perf_counter()

    if not url:
        return {
            "name": integration_name,
            "status": "not_configured",
            "latency_ms": None,
            "message": (
                "No health-check URL is configured "
                "for this integration."
            ),
            "checked_at": datetime.now(
                timezone.utc
            ),
        }

    try:
        request = Request(
            url,
            method="GET",
            headers={
                "User-Agent":
                    "FoodChow-Health-Check/1.0"
            },
        )

        with urlopen(
            request,
            timeout=5,
        ) as response:

            latency = (
                perf_counter() - started
            ) * 1000

            is_success = (
                200 <= response.status < 400
            )

            return {
                "name": integration_name,
                "status": (
                    "connected"
                    if is_success
                    else "error"
                ),
                "latency_ms": round(
                    latency,
                    2,
                ),
                "message": (
                    f"HTTP {response.status}"
                ),
                "checked_at": datetime.now(
                    timezone.utc
                ),
            }

    except (
        URLError,
        TimeoutError,
        OSError,
    ) as exc:

        latency = (
            perf_counter() - started
        ) * 1000

        return {
            "name": integration_name,
            "status": "error",
            "latency_ms": round(
                latency,
                2,
            ),
            "message": str(exc),
            "checked_at": datetime.now(
                timezone.utc
            ),
        }