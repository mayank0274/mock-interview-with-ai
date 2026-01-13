from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_CLIENT_ID: str
    FRONTEND_URL: str
    JWT_SECRET_KEY: str
    GEMINI_API_KEY: str
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_PASSWORD: str
    SUPABASE_SECRET_KEY: str
    SUPABASE_URL: str
    SPEECHMATICS_API_KEY: str
    INNGEST_DEV: int

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
