"""
Pydantic schemas for authentication
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data extracted from JWT token"""
    email: Optional[str] = None
    user_id: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    """Request schema for refreshing access token"""
    refresh_token: str


class EmailVerificationRequest(BaseModel):
    """Request schema for email verification"""
    token: str


class PasswordResetRequest(BaseModel):
    """Request schema for password reset"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Confirm password reset with new password"""
    token: str
    new_password: str


class ChangePassword(BaseModel):
    """Schema for changing password"""
    current_password: str
    new_password: str
