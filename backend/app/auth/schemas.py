from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


UserRole = Literal["admin", "support_agent", "viewer"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole = "support_agent"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    status: str = "active"


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str


class AuthUser(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    status: str = "active"