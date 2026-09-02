from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.admin.service import create_audit_event
from backend.app.auth.dependencies import get_current_user
from backend.app.auth.schemas import (
    AuthUser,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    SignupRequest,
    UserResponse,
)
from backend.app.auth.service import (
    authenticate_user,
    create_access_token,
    create_user,
    serialize_user,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(request: LoginRequest):
    user = authenticate_user(
        email=request.email,
        password=request.password,
    )

    # --------------------------------------------------------
    # FAILED LOGIN
    # --------------------------------------------------------

    if not user:
        create_audit_event(
            user_id="anonymous",
            user_email=str(request.email).strip().lower(),
            action="login_failed",
            resource="authentication",
            severity="warning",
            details={
                "reason": "Invalid email or password",
            },
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    # --------------------------------------------------------
    # SUCCESSFUL LOGIN
    # --------------------------------------------------------

    safe_user = serialize_user(user)

    access_token = create_access_token(user)

    create_audit_event(
        user_id=safe_user["id"],
        user_email=safe_user["email"],
        action="login",
        resource="authentication",
        severity="info",
        details={
            "role": safe_user["role"],
        },
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": safe_user,
    }


# ============================================================
# SIGNUP
# ============================================================

@router.post(
    "/signup",
    response_model=UserResponse,
)
def signup(request: SignupRequest):

    # Public registration cannot create administrators.
    if request.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Administrator accounts can only be "
                "created by an existing administrator."
            ),
        )

    try:
        user = create_user(
            name=request.name,
            email=request.email,
            password=request.password,
            role=request.role,
        )

        return user

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=AuthUser,
)
def me(
    current_user=Depends(get_current_user),
):
    return current_user


# ============================================================
# LOGOUT
# ============================================================

@router.post(
    "/logout",
    response_model=MessageResponse,
)
def logout(
    current_user=Depends(get_current_user),
):
    create_audit_event(
        user_id=current_user["id"],
        user_email=current_user["email"],
        action="logout",
        resource="authentication",
        severity="info",
        details={
            "role": current_user["role"],
        },
    )

    return {
        "message": "Successfully logged out."
    }