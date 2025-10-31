from sqlmodel import SQLModel, Field
from uuid import uuid4
from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class InterviewStatus(str, Enum):
    CREATED = "created"
    STARTED = "started"
    COMPLETED = "completed"


class InterviewSession(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_email: str = Field(foreign_key="users.email")
    job_title: str
    job_description: str
    interview_type: str = Field(default="technical")
    rem_duration: int = 30  # minutes
    interviewer_name: str
    interviewer_gender: str
    interviewer_voice: str
    start_time: datetime = Field(default_factory=datetime.utcnow)
    status: InterviewStatus = Field(default=InterviewStatus.CREATED)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    __tablename__ = "interview_sessions"


class InterviewSessionReq(BaseModel):
    job_title: str = Field(min_length=10)
    job_description: str = Field(min_length=40)
    interview_type: str = Field(default="technical")
