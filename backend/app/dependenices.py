from fastapi import Depends
from .db.pg_conn import get_db_session
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from .services.jwt_service import get_current_user
from datetime import datetime


class CurrentUser:
    email: str
    role: str
    exp: datetime


sessionDep = Annotated[AsyncSession, Depends(get_db_session)]
currentUserDep = Annotated[CurrentUser, Depends(get_current_user)]
