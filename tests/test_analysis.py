"""Tests for analysis orchestration and resilience."""

import asyncio

import pytest
from fastapi.testclient import TestClient

from app.agents.base import BaseAgent
from app.agents.orchestrator import AgentOrchestrator
from app.agents.strategy_agent import StrategyPlanningAgent
import app.api.routes.analysis as analysis_route
from app.main import app
from app.schemas.research import AIAnalysisOutput, AgentResult, BusinessContext, ContextMetadata
from app.services.ai.base import BaseAIProvider, QuotaExhaustedError
from app.services.ai.gemini import GeminiProvider


class FakeProvider(BaseAIProvider):
    async def generate(self, system_prompt: str, user_prompt: str) -> AIAnalysisOutput:
        return AIAnalysisOutput(
            summary="Executive summary from a test provider.",
            findings=["Market insight"],
            recommendations=["Launch a pilot", "Track conversion"],
            risks=["Risk: demand uncertainty"],
            assumptions=["Demand remains stable"],
            confidence=0.8,
            metadata={"test_provider": True},
        )


def _context() -> BusinessContext:
    return BusinessContext(
        business_question="Should EcoRide expand to Mumbai and Bengaluru?",
        business_description="Electric scooter rental startup with a ₹2 crore budget.",
        documents=[],
        combined_context="Target customers are students and delivery workers.",
        metadata=ContextMetadata(
            number_of_documents=0,
            successful_documents=0,
            failed_documents=0,
            total_character_count=0,
        ),
    )


def test_orchestrator_runs_agents_sequentially() -> None:
    orchestrator = AgentOrchestrator(provider=FakeProvider())
    result = asyncio.run(orchestrator.run(_context(), "EcoRide Mobility"))

    assert result.status == "completed"
    assert result.overall_status == "completed"
    assert len(result.agent_results) == 6
    assert all(agent.metadata["test_provider"] for agent in result.agent_results)
    assert result.agent_results[-1].metadata["provider"] == "FakeProvider"


def test_analysis_endpoint_returns_frontend_report_with_fake_provider(monkeypatch) -> None:
    monkeypatch.setattr(
        analysis_route,
        "AgentOrchestrator",
        lambda: AgentOrchestrator(provider=FakeProvider()),
    )
    response = TestClient(app).post(
        "/api/v1/analysis/run",
        json={"business_name": "Example", "context": _context().model_dump()},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "completed"
    assert body["context_metadata"]["number_of_documents"] == 0
    assert len(body["agent_results"]) == 6


def test_context_to_analysis_workflow_with_fake_provider(monkeypatch) -> None:
    monkeypatch.setattr(
        analysis_route,
        "AgentOrchestrator",
        lambda: AgentOrchestrator(provider=FakeProvider()),
    )
    client = TestClient(app)
    context_response = client.post(
        "/api/v1/research/context",
        data={
            "business_question": "Should EcoRide expand to Mumbai?",
            "business_description": "Electric mobility startup with a staged expansion budget.",
        },
    )

    assert context_response.status_code == 200
    context_data = context_response.json()["data"]

    analysis_response = client.post(
        "/api/v1/analysis/run",
        json={"business_name": "EcoRide Mobility", "context": context_data},
    )

    assert analysis_response.status_code == 200
    report = analysis_response.json()
    assert report["business_name"] == "EcoRide Mobility"
    assert report["status"] == "completed"
    assert len(report["agent_results"]) == 6


class FailingAgent(BaseAgent):
    agent_name = "Failing Agent"
    agent_role = "Failing Role"
    description = "Always fails"
    analysis_instructions = "Fail"

    async def run(
        self, context: BusinessContext, previous_results: list[AgentResult] | None = None
    ) -> AgentResult:
        raise RuntimeError("simulated failure")


class CapturingProvider(FakeProvider):
    def __init__(self) -> None:
        self.prompts: list[str] = []

    async def generate(self, system_prompt: str, user_prompt: str) -> AIAnalysisOutput:
        self.prompts.append(user_prompt)
        return await super().generate(system_prompt, user_prompt)


def test_orchestrator_stops_immediately_on_agent_failure() -> None:
    provider = CapturingProvider()
    result = asyncio.run(
        AgentOrchestrator(
            agents=[FailingAgent(provider), StrategyPlanningAgent(provider)]
        ).run(_context())
    )

    assert result.agent_results[0].status == "failed"
    assert result.status == "failed"
    assert result.agent_results[1].status == "skipped"


class QuotaExhaustedProvider(BaseAIProvider):
    def __init__(self) -> None:
        self.call_count = 0

    async def generate(self, system_prompt: str, user_prompt: str) -> AIAnalysisOutput:
        self.call_count += 1
        raise QuotaExhaustedError("RESOURCE_EXHAUSTED: quota exceeded")


def test_orchestrator_handles_quota_exhaustion_gracefully() -> None:
    provider = QuotaExhaustedProvider()
    result = asyncio.run(AgentOrchestrator(provider=provider).run(_context()))

    assert result.agent_results[0].status == "failed"
    assert all(r.status == "skipped" for r in result.agent_results[1:])
    assert len(result.agent_results) == 6


def test_gemini_provider_retry_delay_parser() -> None:
    delay1 = GeminiProvider._extract_retry_delay("Error 429: ResourceExhausted, retryDelay: '12s'")
    assert delay1 == 12.0

    delay2 = GeminiProvider._extract_retry_delay("Quota exceeded, please retry after 8 seconds")
    assert delay2 == 8.0

    delay_default = GeminiProvider._extract_retry_delay("429 Too Many Requests")
    assert delay_default == 4.0
