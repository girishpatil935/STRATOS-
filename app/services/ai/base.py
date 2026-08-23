"""AI provider contract used by Executive_AI agents."""

from abc import ABC, abstractmethod

from app.schemas.research import AIAnalysisOutput


class AIProviderError(RuntimeError):
    """Raised when an AI provider cannot produce a valid response."""


class QuotaExhaustedError(AIProviderError):
    """Raised when an AI provider rate limit / quota is exhausted."""


class BaseAIProvider(ABC):
    """Hide model-vendor implementation details from specialist agents."""

    @abstractmethod
    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        max_output_tokens: int | None = None,
    ) -> AIAnalysisOutput:
        """Generate one structured specialist analysis."""
