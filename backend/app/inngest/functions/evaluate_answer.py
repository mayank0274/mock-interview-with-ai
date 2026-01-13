from datetime import datetime, timezone

from sqlmodel import select

from app.db.pg_conn import get_db_session_ctx
from app.inngest.functions.transcription import append_meta_log
from app.models.interview_session import (
    InterviewResults,
    InterviewSession,
    InterviewStatus,
)
from ..client import inngest_client
from inngest import Context, TriggerEvent, Event
from ...db.redis import redis_client
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from ...llm.config import (
    system_prompt,
    question_parser,
    llm,
    parse_interview_json,
    parse_chat_history,
    result_evaluation_prompt,
    format_history,
    result_parser,
)
from ...llm.redis_memory import get_redis_memory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.messages import HumanMessage, AIMessage


class MetaData(BaseModel):
    transcription: str
    interview_id: str
    audio_path: str


async def generate_next_question(metadata: MetaData):
    audio_eval_key = f"answer:{metadata.interview_id}:{metadata.audio_path}"
    try:
        meta_key = f"interview:{metadata.interview_id}:meta"
        meta = redis_client.hgetall(meta_key)
        if not meta:
            append_meta_log(
                audio_eval_key,
                {
                    "status": "error",
                    "evaluation_payload": None,
                    "error": "Interview expired or not started",
                },
            )
            raise Exception("Interview not started or expired")

        append_meta_log(
            audio_eval_key,
            {
                "status": "evaluation_started",
                "evaluation_payload": None,
                "error": None,
            },
        )

        now = datetime.now(timezone.utc)
        end_time = datetime.fromisoformat(meta["end_time"])
        remaining_seconds = int((end_time - now).total_seconds())

        if remaining_seconds <= 0:
            append_meta_log(
                audio_eval_key,
                {
                    "status": "preparing_result",
                    "evaluation_payload": None,
                    "error": None,
                },
            )

            await inngest_client.send(
                Event(
                    name="interview/interview.completed",
                    data={"interview_id": metadata.interview_id},
                )
            )

            return None

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

        chain = prompt | llm

        chain_with_history = RunnableWithMessageHistory(
            runnable=chain,
            get_session_history=get_redis_memory,
            input_messages_key="candidate_input",
            history_messages_key="history",
        )

        raw_response = chain_with_history.invoke(
            {
                "candidate_input": metadata.transcription,
                "job_title": meta["job_title"],
                "job_description": meta["job_description"],
                "candidate_name": meta["candidate_name"].split("@")[0],
            },
            config={"configurable": {"session_id": metadata.interview_id}},
        )

        parsed = parse_interview_json(
            getattr(raw_response, "content", str(raw_response))
        )
        payload = {
            "interviewer_res": {
                "question": parsed["question"],
                "type": parsed["type"],
                "question_no": parsed["question_no"],
            },
            "remainingSeconds": remaining_seconds,
        }

        append_meta_log(
            audio_eval_key,
            {
                "status": "evaluation_completed",
                "evaluation_payload": payload,
                "error": None,
            },
        )

        return parsed

    except Exception as e:
        append_meta_log(
            audio_eval_key,
            {"status": "error", "evaluation_payload": None, "error": str(e)},
        )
        raise


def save_evaluation_log(data):
    history = get_redis_memory(data["interview_id"])
    history.add_message(HumanMessage(content=data["transcript"]))
    history.add_message(
        AIMessage(
            content=data["question"],
            additional_kwargs={
                "type": data["type"],
                "question_no": data["question_no"],
            },
        )
    )
    return True


@inngest_client.create_function(
    name="evaluate user answer",
    fn_id="evaluate-user-answer",
    trigger=TriggerEvent(event="interview/transcription.completed"),
)
async def evaluate_user_answer(ctx: Context):
    try:
        metadata = MetaData(**ctx.event.data)

        eval_result = await ctx.step.run(
            "generate_next_question", lambda: generate_next_question(metadata)
        )

        if not eval_result:
            return True

        eval_data = {
            "interview_id": metadata.interview_id,
            "transcript": metadata.transcription,
            "question": eval_result["question"],
            "type": eval_result["type"],
            "question_no": eval_result["question_no"],
        }

        await ctx.step.run(
            "store-evaluation-result", lambda: save_evaluation_log(eval_data)
        )

        return eval_data

    except Exception as e:
        audio_eval_key = f"answer:{ctx.event.data.get('interview_id')}:{ctx.event.data.get('audio_path')}"
        append_meta_log(
            audio_eval_key,
            {"status": "error", "evaluation_payload": None, "error": str(e)},
        )
        raise


@inngest_client.create_function(
    name="prepare-interview-result",
    fn_id="prepare-interview-result",
    trigger=TriggerEvent(event="interview/interview.completed"),
)
async def prepare_interview_result(ctx: Context):
    try:
        data = ctx.event.data
        # history = parse_chat_history(get_redis_memory(data["interview_id"]))
        history = parse_chat_history(
            redis_client.lrange(f"message_store:{data['interview_id']}", 0, -1)
        )

        evaluation_chain = result_evaluation_prompt | llm | result_parser
        result = evaluation_chain.invoke({"chat_history": format_history(history)})

        async with get_db_session_ctx() as session:
            interview_res = await session.execute(
                select(InterviewSession).where(
                    InterviewSession.id == data["interview_id"]
                )
            )
            interview = interview_res.scalars().first()
            interview.status = InterviewStatus.COMPLETED

            interview_result = InterviewResults(
                interview_id=data["interview_id"],
                communication_score=float(result.communication_score),
                technical_score=float(result.technical_score),
                clarity_score=float(result.clarity_score),
                suggestions=result.suggestions,
                chats=history,
            )

            session.add(interview_result)
            await session.commit()

        return history

    except Exception as e:
        print(f"[Inngest] Transcription workflow failed error: {str(e)}")
        raise
