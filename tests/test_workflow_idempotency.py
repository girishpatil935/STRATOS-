import asyncio
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.research import AIAnalysisOutput, AgentResult, BusinessContext, ContextMetadata
from app.services.ai.base import BaseAIProvider
import app.api.routes.analysis as analysis_route
from app.agents.orchestrator import AgentOrchestrator


class CountingFakeProvider(BaseAIProvider):
    def __init__(self) -> None:
        self.call_count = 0

    async def generate(self, system_prompt: str, user_prompt: str, **kwargs) -> AIAnalysisOutput:
        self.call_count += 1
        return AIAnalysisOutput(
            summary=f"Analysis call #{self.call_count}",
            findings=["Finding 1"],
            recommendations=["Rec 1"],
            risks=["Risk 1"],
            assumptions=["Assumption 1"],
            confidence=0.9,
        )


def _sample_context() -> BusinessContext:
    return BusinessContext(
        business_question="Should Acme launch product X?",
        business_description="SaaS startup expanding into B2B.",
        documents=[],
        combined_context="Question: Should Acme launch product X?",
        metadata=ContextMetadata(
            number_of_documents=0,
            successful_documents=0,
            failed_documents=0,
            total_character_count=0,
        ),
    )


def test_get_analysis_by_id(monkeypatch: pytest.MonkeyPatch) -> None:
    provider = CountingFakeProvider()
    monkeypatch.setattr(
        analysis_route,
        "AgentOrchestrator",
        lambda: AgentOrchestrator(provider=provider),
    )
    client = TestClient(app)

    res1 = client.post(
        "/api/v1/analysis/run",
        json={"business_name": "GetTest", "context": _sample_context().model_dump()},
    )
    analysis_id = res1.json()["analysis_id"]
    calls_before = provider.call_count

    # GET endpoint fetches data without calling Gemini
    get_res = client.get(f"/api/v1/analysis/{analysis_id}")
    assert get_res.status_code == 200
    assert get_res.json()["analysis_id"] == analysis_id
    assert provider.call_count == calls_before


def test_explicit_new_analysis(monkeypatch: pytest.MonkeyPatch) -> None:
    provider = CountingFakeProvider()
    monkeypatch.setattr(
        analysis_route,
        "AgentOrchestrator",
        lambda: AgentOrchestrator(provider=provider),
    )
    client = TestClient(app)

    res1 = client.post(
        "/api/v1/analysis/run",
        json={"business_name": "ExplicitNew", "context": _sample_context().model_dump()},
    )
    id1 = res1.json()["analysis_id"]

    # Explicit POST /new creates fresh workflow
    res2 = client.post(
        "/api/v1/analysis/new",
        json={"business_name": "ExplicitNew", "context": _sample_context().model_dump()},
    )
    assert res2.status_code == 200
    id2 = res2.json()["analysis_id"]

    assert id1 != id2
    assert provider.call_count == 12
