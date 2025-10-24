from fastapi import FastAPI
from .config import settings
from contextlib import asynccontextmanager
from .db.pg_conn import init_db
from .dependenices import sessionDep
from .models.user import User


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
def root():
    return {"status": settings.DATABASE_URL}


# test route
@app.post("/")
async def add_test_user(session: sessionDep):
    test_user = User(name="test", roll_no=10)
    session.add(test_user)
    await session.commit()
    await session.refresh(test_user)
    return {"user": test_user.dict()}
