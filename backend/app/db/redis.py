import redis
from ..config import settings

# redis_client = redis.Redis(
#     host=settings.REDIS_HOST, port=int(settings.REDIS_PORT), decode_responses=True
# )

redis_client = redis.Redis.from_url(settings.UPSTASH_REDIS_URL)

AUDIO_METADATA_EXPIRY = 12 * 60 * 60  # 12 hrs
INTERVIEW_METADATA_EXPIRY = 12 * 60 * 60  # 12 hrs
