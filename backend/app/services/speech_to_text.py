from io import BytesIO
import json
import time
from ..db.supabase import supabase_client
import requests
from ..config import settings

speechmatics_api_url = "https://eu1.asr.api.speechmatics.com/v2/jobs"
headers = {"Authorization": f"Bearer {settings.SPEECHMATICS_API_KEY}"}


def poll_speechmatics_transcript(job_id, timeout=180, interval=3):
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
                return txt

        elif res.status_code in (202, 204, 404):
            pass
        else:
            raise RuntimeError(
                f"Unexpected transcript status: {res.status_code} {res.text}"
            )

        if time.time() - start > timeout:
            raise TimeoutError("Speechmatics transcript polling timed out")

        time.sleep(interval)


def speech_to_text(data):
    file_bytes = supabase_client.storage.from_("interviewly").download(data["path"])
    files = {"data_file": (data["path"], BytesIO(file_bytes), "audio/wav")}
    config = {"type": "transcription", "transcription_config": {"language": "en"}}
    payload = {"config": json.dumps(config)}
    response = requests.post(
        speechmatics_api_url, headers=headers, files=files, data=payload
    )
    job_id = response.json()["id"]
    transcript = poll_speechmatics_transcript(job_id=job_id, timeout=300, interval=3)

    ## evaultaon here
    result = {
        "transcription_job_id": job_id,
        "audio_path": data["path"],
        "transcript": transcript,
    }

    print(result)
    return result
