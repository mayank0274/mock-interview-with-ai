import random
from fastapi import HTTPException
from fastapi.routing import APIRouter
from ..models.interview_session import (
    InterviewSession,
    InterviewSessionReq,
    InterviewStatus,
)
from ..dependenices import sessionDep, currentUserDep
from sqlmodel import select
from ..models.user import User
from ..services.constants import INTERVIEWERS


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
        print(interview)
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
    description="start",
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
            raise HTTPException(
                status_code=404,
                detail="Interview with given id not exist",
            )

        if currUser.get("email") != interview.user_email:
            raise HTTPException(
                status_code=403,
                detail="Access denied",
            )

        interview.status = InterviewStatus.STARTED
        await session.commit()

        return {"interviewId": interview_id, "status": InterviewStatus.STARTED}

    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while creating interview session",
        )
