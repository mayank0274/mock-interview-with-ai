from langchain_community.chat_message_histories import RedisChatMessageHistory


def get_redis_memory(session_id: str):
    return RedisChatMessageHistory(session_id=session_id, url="redis://localhost:6379")
