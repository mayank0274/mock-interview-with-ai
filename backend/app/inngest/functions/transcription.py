from io import BytesIO
import json
import time
import requests
from ..client import inngest_client
from inngest import Event, Context, TriggerEvent
from ...db.supabase import supabase_client
from ...config import settings
from ...router.upload_files import AudioUploadedData
from ...db.redis import redis_client, AUDIO_METADATA_EXPIRY


speechmatics_api_url = "https://eu1.asr.api.speechmatics.com/v2/jobs"
headers = {"Authorization": f"Bearer {settings.SPEECHMATICS_API_KEY}"}


def append_meta_log(meta_key: str, payload: dict):
    entry = {
        "ts": int(time.time()),
        **payload,
    }
    redis_client.rpush(meta_key, json.dumps(entry))
    redis_client.expire(meta_key, AUDIO_METADATA_EXPIRY)


def download_and_submit_to_speechmatics(audio_path: str):
    # time.sleep(1)
    # return {"job_id": "alpha"}
    file_bytes = supabase_client.storage.from_("interviewly").download(audio_path)
    files = {"data_file": (audio_path, BytesIO(file_bytes), "audio/webm")}
    config = {"type": "transcription", "transcription_config": {"language": "en"}}
    payload = {"config": json.dumps(config)}

    response = requests.post(
        speechmatics_api_url, headers=headers, files=files, data=payload, timeout=60
    )
    response.raise_for_status()
    job_id = response.json().get("id")

    if not job_id:
        raise ValueError("No job_id in Speechmatics response")

    return {"job_id": job_id}


def poll_speechmatics_transcript(job_id, timeout=180, interval=3):
    # time.sleep(2)
    # return {"transcript": "this is mine response"}
    SPEECHMATICS_TRANSCRIPT_URL = (
        "https://eu1.asr.api.speechmatics.com/v2/jobs/{job_id}/transcript?format=txt"
    )
    url = SPEECHMATICS_TRANSCRIPT_URL.format(job_id=job_id)
    start = time.time()

    while True:
        res = requests.get(url, headers=headers)

        if res.status_code == 200:
            txt = res.text.strip()
            if txt:
                print(f"[Transcription] Transcript ready for job {job_id}")
                return {"transcript": txt}
            else:
                return {
                    "transcript": "Can't evaluate your answer , please speak clearly"
                }

        elif res.status_code in (202, 204, 404):
            print(
                f"[Transcription] Transcript not ready yet for job {job_id}, status {res.status_code}"
            )
        else:
            raise RuntimeError(
                f"Unexpected transcript status: {res.status_code} {res.text}"
            )

        if time.time() - start > timeout:
            raise TimeoutError(
                f"Speechmatics transcript polling timed out for job {job_id}"
            )

        time.sleep(interval)


@inngest_client.create_function(
    name="transcription workflow",
    fn_id="transcriobe-audio",
    trigger=TriggerEvent(event="interview/audio.uploaded"),
    retries=1,
)
async def transcription_workflow(ctx: Context):
    metadata: AudioUploadedData = AudioUploadedData(**ctx.event.data)
    meta_key = f"answer:{metadata.interview_id}:{metadata.audio_path}"
    try:
        print(
            f"[Transcription:{metadata.interview_id}] Starting workflow for interview"
        )

        speechmatics_res = await ctx.step.run(
            "submit-to-speechmatics",
            lambda: download_and_submit_to_speechmatics(metadata.audio_path),
        )
        append_meta_log(
            meta_key,
            {
                "status": "transcription_started",
                "evaluation_payload": None,
                "error": None,
            },
        )
        print(
            f"[Transcription:{metadata.interview_id}] Audio submitted to Speechmatics, job id: {speechmatics_res['job_id']}"
        )

        transcription = await ctx.step.run(
            "poll-transcript",
            lambda: poll_speechmatics_transcript(speechmatics_res["job_id"]),
        )
        append_meta_log(
            meta_key,
            {
                "status": "transcription_completed",
                "evaluation_payload": None,
                "error": None,
            },
        )
        print(f"[Transcription:{metadata.interview_id}] Transcription completed")

        final_res = {
            "transcription": transcription["transcript"],
            "interview_id": metadata.interview_id,
            "audio_path": metadata.audio_path,
        }

        job = await inngest_client.send(
            Event(name="interview/transcription.completed", data=final_res)
        )

        return job
    except Exception as e:
        append_meta_log(
            meta_key, {"status": "error", "evaluation_payload": None, "error": str(e)}
        )
        print(f"[Inngest] Transcription workflow failed error: {str(e)}")
        raise
