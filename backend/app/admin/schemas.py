from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


class AdminUserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "support_agent"


class AdminUserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    role: Optional[str] = None
    status: Optional[str] = None


class AdminUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str


class AdminUsersResponse(BaseModel):
    users: list[AdminUserResponse]
    total: int


class AuditEventResponse(BaseModel):
    id: str
    user_id: str
    user_email: str
    action: str
    resource: str
    resource_id: Optional[str] = None
    severity: str = "info"
    details: dict[str, Any] = {}
    created_at: Any


class AuditLogsResponse(BaseModel):
    events: list[AuditEventResponse]
    total: int


class SystemSettingsUpdate(BaseModel):
    settings: dict[str, Any]


class SystemSettingsResponse(BaseModel):
    settings: dict[str, Any]


class IntegrationCheckResponse(BaseModel):
    name: str
    status: str
    latency_ms: Optional[float] = None
    message: str
    checked_at: Any