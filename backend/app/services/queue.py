from rq import Queue
from ..db.redis import redis_client

SPEECT_TO_TEXT = "speech_to_text"

stt_queue = Queue(SPEECT_TO_TEXT, redis_client)
