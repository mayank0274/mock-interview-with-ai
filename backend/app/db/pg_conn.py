from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from ..config import settings
from sqlmodel import SQLModel

engine = create_async_engine(settings.DATABASE_URL, echo=True)
create_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("[pgsql] : connection success")


async def get_db_session():
    session: AsyncSession = create_session()
    try:
        yield session
    finally:
        await session.close()
