import redis
from ..config import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST, port=int(settings.REDIS_PORT), decode_responses=True
)

AUDIO_METADATA_EXPIRY = 12 * 60 * 60  # 12 hrs
INTERVIEW_METADATA_EXPIRY = 12 * 60 * 60  # 12 hrs
