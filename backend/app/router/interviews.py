import json
import random
from typing import Optional
from fastapi import HTTPException
from fastapi.routing import APIRouter
from urllib.parse import unquote

from app.llm.redis_memory import get_redis_memory
from ..models.interview_session import (
    InterviewResults,
    InterviewSession,
    InterviewSessionReq,
    InterviewStatus,
)
from ..dependenices import sessionDep, currentUserDep
from sqlmodel import select, func
from ..models.user import User
from ..services.constants import INTERVIEWERS
from pydantic import BaseModel
from ..llm.config import (
    llm,
    parse_interview_json,
    system_prompt,
    question_parser,
)
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from datetime import datetime, timezone
from ..db.redis import redis_client, INTERVIEW_METADATA_EXPIRY
from datetime import timedelta
from ..inngest.client import inngest_client
from inngest import Event

INTERVIEW_DURATION_MINUTES = 10
REDIS_BUFFER_SECONDS = 60


class CandidateResponse(BaseModel):
    msg: str
    interview_id: str


interviews_router = APIRouter(prefix="/interview", tags=["interviews"])


@interviews_router.post(
    "/", description="create interview session", response_model=InterviewSession
)
async def create_interview(
    req: InterviewSessionReq, user: currentUserDep, session: sessionDep
):
    try:
        user_from_db = await session.execute(
            select(User).where(User.email == user.get("email"))
        )
        user_res = user_from_db.scalars().first()

        if not user_res:
            raise HTTPException(status_code=401, detail="Unauthorized user")

        if user_res.credits_remaining <= 0:
            raise HTTPException(
                status_code=402,
                detail="You doesn't have enough credits to create interview",
            )

        interviewer = random.choice(INTERVIEWERS)
        interview = InterviewSession(
            user_email=user_res.email,
            job_title=req.job_title,
            job_description=req.job_description,
            interview_type=req.interview_type,
            interviewer_gender=interviewer["gender"],
            interviewer_name=interviewer["name"],
            interviewer_voice=interviewer["voice"],
        )
        session.add(interview)
        user_res.credits_remaining = user_res.credits_remaining - 1
        await session.commit()
        await session.refresh(interview)

        return interview

    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while creating interview session",
        )


@interviews_router.get(
    "/{interview_id}",
    description="get interview details",
    response_model=InterviewSession,
)
async def get_interview_details(
    interview_id: str, currUser: currentUserDep, session: sessionDep
):
    try:
        interview_res = await session.execute(
            select(InterviewSession).where(InterviewSession.id == interview_id)
        )
        interview = interview_res.scalars().first()
        if not interview:
            raise HTTPException(
                status_code=404,
                detail="Interview with given id not exist",
            )

        if currUser.get("email") != interview.user_email:
            raise HTTPException(
                status_code=403,
                detail="Access denied",
            )

        return interview

    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while creating interview session",
        )


@interviews_router.patch(
    "/start/{interview_id}",
    description="Start interview session",
)
async def start_interview(
    interview_id: str, currUser: currentUserDep, session: sessionDep
):
    try:
        interview_res = await session.execute(
            select(InterviewSession).where(InterviewSession.id == interview_id)
        )
        interview = interview_res.scalars().first()

        if not interview:
            raise HTTPException(404, "Interview with given id does not exist")

        if currUser.get("email") != interview.user_email:
            raise HTTPException(403, "Access denied")

        if interview.status != InterviewStatus.CREATED:
            raise HTTPException(400, "This interview is already started or completed")

        now = datetime.now(timezone.utc)

        interview.start_time = now
        interview.end_time = now + timedelta(minutes=INTERVIEW_DURATION_MINUTES)
        interview.status = InterviewStatus.STARTED

        await session.commit()
        redis_client.hmset(
            f"interview:{interview_id}:meta",
            {
                "job_title": interview.job_title,
                "job_description": interview.job_description,
                "candidate_name": currUser.get("email"),
                "start_time": interview.start_time.isoformat(),
                "end_time": interview.end_time.isoformat(),
                "duration_seconds": INTERVIEW_DURATION_MINUTES * 60,
                "status": "STARTED",
            },
        )
        redis_client.expire(
            f"interview:{interview_id}:meta",
            INTERVIEW_METADATA_EXPIRY,
        )
        return {
            "interviewId": interview_id,
            "status": InterviewStatus.STARTED,
            "startTime": interview.start_time.isoformat(),
            "endTime": interview.end_time.isoformat(),
            "durationMinutes": INTERVIEW_DURATION_MINUTES,
            "remainingSeconds": INTERVIEW_DURATION_MINUTES * 60,
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Interview Start Error:", e)
        raise HTTPException(500, "Error starting interview session")


@interviews_router.get(
    "/evaluation-status/",
    description="Get answer evaluation status",
)
async def get_evaluation(interview_id: str, audio_path: str):
    try:
        meta_key = f"answer:{interview_id}:{audio_path}"
        data = redis_client.lindex(unquote(meta_key), -1)

        if data is None:
            return {
                "status": "processing...",
                "evaluation_payload": None,
                "error": None,
            }
        return json.loads(data)
    except Exception as e:
        print("answer eval result error:", e)
        raise HTTPException(500, "Something went wrong while fetching the result")


@interviews_router.post("/chat")
async def chat(req: CandidateResponse, currUser: currentUserDep, session: sessionDep):
    try:
        meta_key = f"interview:{req.interview_id}:meta"
        meta = redis_client.hgetall(meta_key)

        if not meta:
            raise HTTPException(400, "Interview not started or expired")

        if meta.get("candidate_name") != currUser.get("email"):
            raise HTTPException(403, "Access denied")

        # -------- TIME CHECK --------
        now = datetime.now(timezone.utc)
        end_time = datetime.fromisoformat(meta["end_time"])
        remaining_seconds = int((end_time - now).total_seconds())

        if remaining_seconds <= 0:
            redis_client.hset(meta_key, "status", InterviewStatus.COMPLETED)

            interview_res = await session.execute(
                select(InterviewSession).where(InterviewSession.id == req.interview_id)
            )
            interview = interview_res.scalars().first()
            interview.status = InterviewStatus.COMPLETED
            await session.commit()

            # save final user response in history
            try:
                history = get_redis_memory(req.interview_id)
                history.add_message(HumanMessage(content=req.msg))
            except Exception as e:
                print("Failed to store final answer in history:", e)

            return {
                "message": "Interview session has ended.",
                "remainingSeconds": 0,
                "interviewer_res": None,
                "redirect": True,
            }

        # -------- LLM PROMPT --------
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                MessagesPlaceholder(variable_name="history"),
                (
                    "system",
                    f"Remaining interview time (seconds): {remaining_seconds}. Follow timing rules strictly.",
                ),
                ("human", "{candidate_input}"),
            ]
        ).partial(format_instructions=question_parser.get_format_instructions())

        def debug(x):
            print("Prompt Input:", x)
            return x

        chain = prompt | llm

        chain_with_history = RunnableWithMessageHistory(
            runnable=chain,
            get_session_history=get_redis_memory,
            input_messages_key="candidate_input",
            history_messages_key="history",
        )

        raw_response = chain_with_history.invoke(
            {
                "candidate_input": req.msg,
                "job_title": meta["job_title"],
                "job_description": meta["job_description"],
                "candidate_name": meta["candidate_name"].split("@")[0],
            },
            config={"configurable": {"session_id": req.interview_id}},
        )

        print(raw_response.content)
        response = parse_interview_json(raw_response.content)

        # -------- SAVE CHAT HISTORY --------
        history = get_redis_memory(req.interview_id)
        history.add_message(HumanMessage(content=req.msg))
        history.add_message(
            AIMessage(
                content=response.question,
                additional_kwargs={
                    "type": response.type,
                    "question_no": response.question_no,
                },
            )
        )

        # -------- UPDATE REDIS AGGREGATE SCORES --------
        if response.evaluation:
            try:
                agg_key = f"interview:{req.interview_id}:aggregate"
                sug_key = f"interview:{req.interview_id}:suggestions"

                pipe = redis_client.pipeline()

                pipe.hincrbyfloat(
                    agg_key, "total_comm", response.evaluation.communication
                )
                pipe.hincrbyfloat(
                    agg_key, "total_tech", response.evaluation.technical_knowledge
                )
                pipe.hincrbyfloat(agg_key, "total_clarity", response.evaluation.clarity)
                pipe.hincrby(agg_key, "count", 1)

                pipe.rpush(sug_key, response.evaluation.suggestion)

                pipe.expire(agg_key, 3 * 60 * 60)
                pipe.expire(sug_key, 3 * 60 * 60)

                pipe.execute()
            except Exception as e:
                print("Failed to update aggregate:", e)

        return {
            "interviewer_res": {
                "question": response.question,
                "type": response.type,
                "question_no": response.question_no,
            },
            "remainingSeconds": remaining_seconds,
        }

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Chat Error:", e)
        raise HTTPException(500, "Something went wrong while talking to interviewer")


@interviews_router.get(
    "/result/{interview_id}", description="get interview result by id"
)
async def get_result(interview_id: str, currUser: currentUserDep, session: sessionDep):
    try:
        interview_res = await session.execute(
            select(InterviewSession).where(InterviewSession.id == interview_id)
        )
        interview = interview_res.scalars().first()

        if not interview:
            raise HTTPException(404, "Interview with given id does not exist")

        if currUser.get("email") != interview.user_email:
            raise HTTPException(403, "Access denied")

        if interview.status != InterviewStatus.COMPLETED:
            raise HTTPException(
                400, "This interview is not completed or we are preapring results"
            )

        interview_results = await session.execute(
            select(InterviewResults).where(
                InterviewResults.interview_id == interview_id
            )
        )
        target_result = interview_results.scalars().first()

        if target_result:
            new_data = {
                **target_result.__dict__,
                "job_title": interview.job_title,
                "status": interview.status,
                "end_time": interview.end_time,
            }
            return new_data

        return {"status": "Preparing Result"}
    except HTTPException:
        raise
    except Exception as e:
        print("Interview result", e)
        raise HTTPException(500, "Something went wrong while creating result")


@interviews_router.get("/", description="get interview history")
async def get_history(
    page_no: Optional[int], currUser: currentUserDep, session: sessionDep
):
    try:
        limit = 10
        page_no = max(page_no or 1, 1)
        offset = (page_no - 1) * limit

        total = await session.scalar(
            select(func.count(InterviewSession.id)).where(
                InterviewSession.user_email == currUser.get("email")
            )
        )

        result = await session.execute(
            select(InterviewSession)
            .where(InterviewSession.user_email == currUser.get("email"))
            .order_by(InterviewSession.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        interviews = result.scalars().all()

        return {
            "results": interviews,
            "total": total or 0,
            "page": page_no,
            "limit": limit,
        }

    except HTTPException:
        raise
    except Exception as e:
        print("Interview history", e)
        raise HTTPException(500, "Something went wrong while fetching history")


@interviews_router.patch(
    "/end/{interview_id}", description="manually end interview in-bteween"
)
async def end_interview(
    interview_id: str, currUser: currentUserDep, session: sessionDep
):
    try:
        interview_res = await session.execute(
            select(InterviewSession).where(InterviewSession.id == interview_id)
        )
        interview = interview_res.scalars().first()

        if not interview:
            raise HTTPException(404, "Interview with given id does not exist")

        if currUser.get("email") != interview.user_email:
            raise HTTPException(403, "Access denied")

        now = datetime.now(timezone.utc)

        interview.end_time = now
        await session.commit()

        await inngest_client.send(
            Event(
                name="interview/interview.completed",
                data={"interview_id": interview_id},
            )
        )

        return {"message": "Result preperation started"}

    except HTTPException:
        raise
    except Exception as e:
        print("Interview end Error:", e)
        raise HTTPException(500, "Error starting ending session")
