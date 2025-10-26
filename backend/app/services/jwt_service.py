from fastapi import HTTPException, Request, status
from jose import jwt, JWTError
from datetime import datetime, timedelta
from ..config import settings


def encode_jwt(data):
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=24 * 60)
    token = jwt.encode(payload, settings.JWT_SECRET_KEY)
    return token


def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
        )

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )

    return payload
