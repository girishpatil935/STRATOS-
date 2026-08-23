"""Sequential orchestration for the Executive_AI specialist-agent foundation."""

from collections.abc import Sequence
from datetime import UTC, datetime
from uuid import uuid4

from app.agents.base import BaseAgent
from app.agents.finance_agent import FinanceAgent
from app.agents.legal_agent import LegalComplianceAgent
from app.agents.market_agent import MarketAnalysisAgent
from app.agents.research_agent import ResearchAgent
from app.agents.risk_agent import RiskAssessmentAgent
from app.agents.strategy_agent import StrategyPlanningAgent
from app.core.logging import get_logger
from app.schemas.research import AgentResult, BusinessContext, RunAnalysisResponse
from app.services.ai.base import AIProviderError, BaseAIProvider, QuotaExhaustedError
from app.services.ai.factory import create_ai_provider
from app.services.ai.gemini import GeminiProvider
from app.services.report_service import build_executive_report

logger = get_logger(__name__)


class AgentOrchestrator:
    """Strictly sequential orchestrator with quota protection, failure isolation, and partial report generation."""

    def __init__(
        self, agents: Sequence[BaseAgent] | None = None, provider: BaseAIProvider | None = None
    ) -> None:
        self.provider = provider or create_ai_provider()
        self.agents = list(agents) if agents is not None else [
            ResearchAgent(self.provider),
            MarketAnalysisAgent(self.provider),
            FinanceAgent(self.provider),
            RiskAssessmentAgent(self.provider),
            LegalComplianceAgent(self.provider),
            StrategyPlanningAgent(self.provider),
        ]

    async def run(
        self,
        context: BusinessContext,
        business_name: str | None = None,
        analysis_id: str | None = None,
        existing_results: list[AgentResult] | None = None,
        retry_only_failed: bool = False,
    ) -> RunAnalysisResponse:
        """Execute agents strictly sequentially. Stop immediately on failure and skip remaining agents."""
        run_id = analysis_id or str(uuid4())
        total_agents = len(self.agents)
        logger.info(
            "[TRACE] orchestrator entered (id=%s, business_name='%s', total_agents=%d)",
            run_id,
            business_name or "Unknown",
            total_agents,
        )

        if not retry_only_failed and isinstance(self.provider, GeminiProvider):
            self.provider.reset_circuit_breaker()

        existing_by_name = {r.agent_name: r for r in (existing_results or [])}
        results: list[AgentResult] = []
        stopped_due_to_failure = False

        for idx, agent in enumerate(self.agents):
            existing_res = existing_by_name.get(agent.agent_name)

            if retry_only_failed and existing_res and existing_res.status == "completed":
                logger.info("Reusing previous successful result for %s (0 AI tokens)", agent.agent_name)
                results.append(existing_res)
                continue

            if stopped_due_to_failure or (
                isinstance(self.provider, GeminiProvider) and self.provider.is_circuit_breaker_active()
            ):
                logger.warning(
                    "Workflow stopped due to previous failure/quota. Marking %s as SKIPPED.",
                    agent.agent_name,
                )
                results.append(
                    AgentResult(
                        agent_name=agent.agent_name,
                        status="skipped",
                        summary="Agent execution skipped because workflow stopped on prior failure.",
                        findings=[],
                        recommendations=[],
                        risks=[],
                        assumptions=[],
                        error="Skipped due to prior agent failure.",
                        metadata={"skipped": True},
                    )
                )
                continue

            try:
                logger.info("[TRACE] %s starting (step %d/%d)", agent.agent_name, idx + 1, total_agents)
                result = await agent.run(context, results)
                logger.info("[TRACE] result saved for %s (status=%s)", agent.agent_name, result.status)
                results.append(result)
            except QuotaExhaustedError as quota_err:
                logger.error("Quota error on %s: %s. Stopping workflow.", agent.agent_name, quota_err, exc_info=True)
                results.append(
                    AgentResult(
                        agent_name=agent.agent_name,
                        status="failed",
                        summary="Agent execution failed due to API quota limits.",
                        findings=[],
                        recommendations=[],
                        risks=[],
                        assumptions=[],
                        error="API quota exhausted (429).",
                        metadata={"error_type": "QuotaExhaustedError"},
                    )
                )
                stopped_due_to_failure = True
            except Exception as exc:
                logger.error("Execution error on %s: %s. Stopping workflow.", agent.agent_name, exc, exc_info=True)
                error_msg = (
                    str(exc)
                    if isinstance(exc, AIProviderError)
                    else f"Agent failed: {exc}"
                )
                results.append(
                    AgentResult(
                        agent_name=agent.agent_name,
                        status="failed",
                        summary="Agent execution failed.",
                        findings=[],
                        recommendations=[],
                        risks=[],
                        assumptions=[],
                        error=error_msg,
                        metadata={"error_type": exc.__class__.__name__},
                    )
                )
                stopped_due_to_failure = True

        failure_count = sum(result.status == "failed" for result in results)
        successful_count = sum(result.status == "completed" for result in results)

        logger.info(
            "Completed sequential orchestration: %d/%d agents completed successfully, %d failed, %d skipped",
            successful_count,
            total_agents,
            failure_count,
            total_agents - (successful_count + failure_count),
        )

        return build_executive_report(
            analysis_id=run_id,
            business_name=business_name,
            agent_results=results,
            created_at=datetime.now(UTC).isoformat(),
            execution_metadata={
                "execution_mode": "sequential",
                "total_agents": total_agents,
                "successful_agents": successful_count,
                "failed_agents": failure_count,
                "skipped_agents": total_agents - (successful_count + failure_count),
                "stopped_due_to_failure": stopped_due_to_failure,
            },
            context=context,
        )
