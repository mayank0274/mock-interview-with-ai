import app.config
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db.pg_conn import init_db
from starlette.middleware.sessions import SessionMiddleware
from .router.auth import auth_router
from .router.interviews import interviews_router
from .db.redis import redis_client
from .router.upload_files import upload_file_router
from inngest.fast_api import serve
from .inngest.client import inngest_client
from .inngest.functions.transcription import transcription_workflow
from .inngest.functions.evaluate_answer import (
    evaluate_user_answer,
    prepare_interview_result,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print(f"[redis connection] : {redis_client.ping()}")
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
app.include_router(interviews_router)
app.include_router(upload_file_router)
serve(
    app=app,
    client=inngest_client,
    functions=[transcription_workflow, evaluate_user_answer, prepare_interview_result],
)


@app.exception_handler(HTTPException)
def handle_exception(req: Request, exc: HTTPException):
    print({"errorMsg": exc.detail, "statusCode": exc.status_code})
    return JSONResponse(
        status_code=exc.status_code,
        content={"errorMsg": exc.detail, "statusCode": exc.status_code},
    )


@app.get("/")
async def root():
    return {"status": "ok"}
