from fastapi import Depends
from .db.pg_conn import get_db_session
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession

sessionDep = Annotated[AsyncSession, Depends(get_db_session)]
