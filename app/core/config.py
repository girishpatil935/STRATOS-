"""Centralized application configuration."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Settings loaded from environment variables and an optional .env file."""

    app_name: str = "STRATOS"
    app_env: str = "development"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000
    max_upload_size_bytes: int = 10 * 1024 * 1024
    max_document_context_chars: int = 12_000
    max_llm_context_chars: int = 3_500
    ai_provider: str = "gemini"
    gemini_model: str = "gemini-3.5-flash-lite"
    gemini_api_key: str | None = None
    ai_request_timeout_seconds: int = 60
    gemini_max_output_tokens: int = 1500
    gemini_strategy_max_output_tokens: int = 2000
    gemini_temperature: float = 0.2
    gemini_request_delay_seconds: float = 4.0
    gemini_max_retries: int = 1
    max_consecutive_quota_errors: int = 2
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    llm_provider: str | None = None
    llm_model: str | None = None
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    tavily_api_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        """Return comma-separated frontend origins as a clean middleware list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return a cached settings instance."""
    return Settings()
