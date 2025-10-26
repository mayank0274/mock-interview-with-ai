from sqlmodel import SQLModel, Field
from enum import Enum
from typing import Optional
from datetime import datetime


class Role(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class SubscriptionTier(str, Enum):
    Free = "Free"
    Premium = "Premium"


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    # Google OAuth Data
    name: str
    email: str = Field(unique=True, index=True)
    avatar_url: Optional[str]
    # Account Status
    role: Role = Field(default=Role.USER)
    is_active: bool = Field(default=True)
    # Payment
    subscription_tier: SubscriptionTier = Field(default=SubscriptionTier.Free)
    credits_remaining: int = Field(default=1)
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "users"
