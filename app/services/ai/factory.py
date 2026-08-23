"""Create the configured AI provider."""

from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.services.ai.base import BaseAIProvider
from app.services.ai.gemini import GeminiProvider

logger = get_logger(__name__)


def create_ai_provider(settings: Settings | None = None) -> BaseAIProvider:
    """Return the configured provider without exposing vendor details to agents."""
    active_settings = settings or get_settings()
    if active_settings.ai_provider.lower() == "gemini":
        logger.info("Configured AI provider: Gemini (%s)", active_settings.gemini_model)
        return GeminiProvider(
            api_key=active_settings.gemini_api_key,
            model=active_settings.gemini_model,
            timeout_seconds=active_settings.ai_request_timeout_seconds,
        )
    raise ValueError(f"Unsupported AI provider: {active_settings.ai_provider}")
