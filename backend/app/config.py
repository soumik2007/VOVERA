from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DEPLOYMENT_PHASE: str = "consumer"
    DATABASE_URL: str = "sqlite:///./vovera.db"
    REDIS_URL: Optional[str] = None
    SECRET_KEY: str = "dev_secret_key"
    ENCRYPTION_KEY: str = "N0Y4X2s1djhrOVRyU1l4dThhOF85M1J3Z280SGRDZm8="
    GOOGLE_TRANSLATION_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
