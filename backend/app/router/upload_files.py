from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from ..db.supabase import supabase_client
from ..inngest.client import inngest_client
from inngest import Event
from pydantic import BaseModel
from ..db.redis import redis_client


class AudioUploadedData(BaseModel):
    audio_path: str
    interview_id: str


upload_file_router = APIRouter(prefix="/upload", tags=["upload files"])


def get_signed_url(bucket, path):
    url = supabase_client.storage.from_(bucket).create_signed_upload_url(path)
    return url


def upload_to_supabase(bucket: str, path: str, file_bytes: bytes):
    response = supabase_client.storage.from_(bucket).upload(
        path=path, file=file_bytes, file_options={"content-type": "audio/webm"}
    )

    print(response)
    if response.path:
        return response.path
    raise Exception("Something went wrong while uploading audio")


@upload_file_router.get("/{interview_id}/{chunk}")
def upload_audio_signed_url(interview_id: str, chunk: str):
    try:
        path = f"audio/{interview_id}/{chunk}.webm"
        url = get_signed_url("interviewly", path)

        return {"url": url["signed_url"]}
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Something went wrong while generatins signed upload url",
        )


@upload_file_router.post("/")
async def upload_file(
    interview_id: str = Form(...),
    file: UploadFile = File(...),
):
    try:
        audio_chunk_seq_key = f"audio_chunk:{interview_id}"
        chunk_number = redis_client.incr(audio_chunk_seq_key)

        filename = f"{chunk_number}.webm"
        path = f"audio/{interview_id}/{filename}"

        file_bytes = await file.read()
        upload_to_supabase("interviewly", path, file_bytes)

        job_data = {
            "audio_path": path,
            "interview_id": interview_id,
            "chunk_number": chunk_number,
            "filename": filename,
        }

        job = await inngest_client.send(
            Event(
                name="interview/audio.uploaded",
                data=job_data,
            )
        )

        return {"message": "Upload successful!", "job_id": job[0], **job_data}

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
        )
