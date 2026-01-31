from authlib.integrations.starlette_client import OAuth
from fastapi import HTTPException
from ..config import settings
from fastapi.routing import APIRouter
from starlette.requests import Request
from starlette.responses import RedirectResponse
from ..dependenices import sessionDep
from ..models.user import User
from sqlmodel import select
from ..services.jwt_service import encode_jwt
from ..dependenices import currentUserDep

google_oauth = OAuth()
google_oauth.register(
    name="google_oauth",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "email profile"},
)

auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post(
    "/login",
    description="redirect user to Google -> we make a get req from frontend to it",
)
async def init_login(request: Request):
    try:
        redirect_uri = redirect_uri = f"{settings.BACKEND_URL}/auth/google/callback"
        redirect_response = await google_oauth.google_oauth.authorize_redirect(
            request, redirect_uri
        )
        google_auth_url = redirect_response.headers.get("location")
        return {"auth_url": google_auth_url}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong while login")


# handle response from Google
@auth_router.get(
    "/google/callback",
    name="auth_via_google_callback",
    description="after we approve login will be redirectd to this here we will save data to db abd redirect back to frontend",
)
async def auth_via_google_callback(request: Request, session: sessionDep):
    try:
        token = await google_oauth.google_oauth.authorize_access_token(request)
        user = await google_oauth.google_oauth.userinfo(token=token)
        res = await session.execute(select(User).where(User.email == user.get("email")))
        existing_user = res.scalars().first()
        #  if not user add in db
        if not existing_user:
            session.add(
                User(
                    name=user.get("name"),
                    email=user.get("email"),
                    avatar_url=user.get("picture"),
                )
            )
            await session.commit()

        print("here")
        token = encode_jwt({"email": user.get("email"), "role": existing_user.role})
        response = RedirectResponse(
            url=f"{settings.FRONTEND_URL}/dashboard/create-interview",
            status_code=302,
        )
        response.set_cookie("access_token", token)
        return response
    except Exception:
        raise HTTPException(
            status_code=500, detail="Something went wrong while authentiction"
        )


@auth_router.get(
    "/me", description="get logged in user via jwt token", response_model=User
)
async def me(currUser: currentUserDep, session: sessionDep):
    try:
        res = await session.execute(
            select(User).where(User.email == currUser.get("email"))
        )
        user = res.scalars().first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user
    except Exception:
        raise HTTPException(
            status_code=500, detail="Something went wrong getting user details"
        )


@auth_router.get("/redirect", description="redirect after auth success")
async def auth_redirect():
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/dashboard/create-interview",
        status_code=302,
    )
