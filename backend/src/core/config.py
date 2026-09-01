from functools import lru_cache
from typing import Annotated, Any, Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    environment: Literal["local", "dev", "staging", "prod"] = "local"
    log_level: str = "INFO"

    # SQLAlchemy async URL (asyncpg driver). Used by the FastAPI runtime.
    # Local default matches docker-compose. Set to the provider's async URL in
    # production (e.g. Neon: swap `postgresql://` → `postgresql+asyncpg://` and
    # `sslmode=require` → `ssl=require`).
    database_url: str = "postgresql+asyncpg://artlas:artlas@localhost:5432/artlas"

    # Sync URL used by Alembic (psycopg driver). Same DB, different Python
    # driver — see docs/database-urls.md if that surprises you. Provider async
    # URLs use `ssl=require`; sync URLs use `sslmode=require`.
    sync_database_url: str = "postgresql+psycopg://artlas:artlas@localhost:5432/artlas"

    jwt_secret_key: str = Field(min_length=32)
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str):
            return [o.strip() for o in v.split(",") if o.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
