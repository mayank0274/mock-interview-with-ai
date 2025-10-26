from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db.pg_conn import init_db
from starlette.middleware.sessions import SessionMiddleware
from .router.auth import auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)
app.add_middleware(SessionMiddleware, secret_key="some-random-string")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)


@app.exception_handler(HTTPException)
def handle_exception(req: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"errorMsg": exc.detail, "statusCode": exc.status_code},
    )


@app.get("/")
def root():
    return {"status": "ok"}
