"""Shared LLM-backed implementation for all specialist agents."""

from abc import ABC
import inspect

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.research import AIAnalysisOutput, AgentResult, BusinessContext
from app.services.ai.base import BaseAIProvider
from app.services.ai.factory import create_ai_provider
from app.services.context_formatter import format_business_context

logger = get_logger(__name__)


class BaseAgent(ABC):
    """Consistent async interface that delegates generation to one provider layer."""

    agent_name: str
    agent_role: str
    description: str
    analysis_instructions: str
    uses_previous_results = False
    max_output_tokens: int | None = None

    def __init__(self, provider: BaseAIProvider | None = None) -> None:
        self.provider = provider or create_ai_provider()

    async def run(
        self, context: BusinessContext, previous_results: list[AgentResult] | None = None
    ) -> AgentResult:
        """Request validated structured analysis from the configured AI provider."""
        logger.info("[TRACE] %s execution entered", self.agent_name)
        user_prompt = self._build_user_prompt(context, previous_results or [])
        logger.info("[TRACE] prompt built for %s (%d chars)", self.agent_name, len(user_prompt))
        tokens_limit = self.max_output_tokens or get_settings().gemini_max_output_tokens

        logger.info("[TRACE] Gemini call starting for %s (tokens_limit=%d)", self.agent_name, tokens_limit)
        
        # Check signature for backwards-compatibility with test providers
        sig = inspect.signature(self.provider.generate)
        if "max_output_tokens" in sig.parameters or any(
            p.kind == inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values()
        ):
            output = await self.provider.generate(
                self._system_prompt(), user_prompt, max_output_tokens=tokens_limit
            )
        else:
            output = await self.provider.generate(self._system_prompt(), user_prompt)

        logger.info("[TRACE] validation successful for %s", self.agent_name)
        result = self._to_agent_result(output)
        logger.info("[TRACE] result ready for save for %s (status=completed)", self.agent_name)
        return result

    def _system_prompt(self) -> str:
        return f"""You are the {self.agent_name} in the STRATOS executive AI system.
{self.analysis_instructions}

OUTPUT CONSTRAINTS (STRICT):
- Return ONLY a valid JSON object with keys: "summary", "findings", "recommendations", "risks", "assumptions", "confidence".
- summary: max 2 sentences (80 words max).
- findings: array of 3 short string bullet points.
- recommendations: array of 3 short string bullet points.
- risks: array of 3 short string bullet points.
- assumptions: array of 2 short string bullet points.
- confidence: float score between 0.0 and 1.0 (e.g. 0.85).
- Do NOT wrap in markdown markdown code blocks, return raw JSON string."""

    def _build_user_prompt(
        self, context: BusinessContext, previous_results: list[AgentResult]
    ) -> str:
        prompt = format_business_context(context)
        if self.uses_previous_results:
            compact_synthesis = self._format_compact_results(previous_results)
            prompt += f"\n\nSPECIALIST SUMMARIES TO SYNTHESIZE:\n{compact_synthesis}"
        return prompt

    @staticmethod
    def _format_compact_results(results: list[AgentResult]) -> str:
        """Create a lightweight structured summary of completed specialist agents."""
        if not results:
            return "No previous specialist outputs available."
        lines = []
        for r in results:
            if r.status == "completed":
                recs_str = f" | Recs: {'; '.join(r.recommendations[:2])}" if r.recommendations else ""
                risks_str = f" | Risks: {'; '.join(r.risks[:2])}" if r.risks else ""
                lines.append(f"{r.agent_name} [{r.status}]: {r.summary}{recs_str}{risks_str}")
            else:
                lines.append(f"{r.agent_name} [{r.status}]: {r.error or 'Analysis unavailable'}")
        return "\n".join(lines)

    def _to_agent_result(self, output: AIAnalysisOutput) -> AgentResult:
        return AgentResult(
            agent_name=self.agent_name,
            status="completed",
            summary=output.summary,
            findings=output.findings[:3],
            recommendations=output.recommendations[:3],
            risks=output.risks[:3],
            assumptions=output.assumptions[:2],
            confidence=output.confidence,
            metadata={"provider": self.provider.__class__.__name__, **output.metadata},
        )
