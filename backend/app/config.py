from functools import lru_cache
from os import getenv
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel

BACKEND_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(BACKEND_ENV_PATH)


class Settings(BaseModel):
    app_name: str = "ComplyNest API"
    app_env: str = "development"
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_jwt_secret: str = ""

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            app_name=getenv("APP_NAME", "ComplyNest API"),
            app_env=getenv("APP_ENV", "development"),
            supabase_url=getenv("SUPABASE_URL", ""),
            supabase_anon_key=getenv("SUPABASE_ANON_KEY", ""),
            supabase_jwt_secret=getenv("SUPABASE_JWT_SECRET", ""),
        )

@lru_cache
def get_settings() -> Settings:
    return Settings.from_env()