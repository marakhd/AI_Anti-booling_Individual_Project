from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Telegram
    bot_token: str = "8598180577:AAH46KUy4Ilj5SOuiY8WsgfodNaWpufvNxU"
    admin_chat_id: int = 2075302695


    # Moderation thresholds
    toxicity_threshold: float = 0.7
    warning_threshold: float = 0.4
    max_violations_before_ban: int = 3

    # Database
    database_url: str = "sqlite+aiosqlite:///./toxguard.db"

    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # CORS — разрешаем Next.js фронт
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    class Config:
        env_file = ".env.example"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
