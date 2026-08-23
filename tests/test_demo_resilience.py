import asyncio

import pytest

from app.agents.orchestrator import AgentOrchestrator
from app.schemas.research import AIAnalysisOutput, BusinessContext, ContextMetadata
from app.services.ai.base import AIProviderError, BaseAIProvider
from app.services.ai.gemini import GeminiProvider
from app.services.document_service import DocumentExtraction, extract_document, limit_document_text
import app.services.document_service as document_service


class FakeProvider(BaseAIProvider):
    async def generate(self, system_prompt: str, user_prompt: str) -> AIAnalysisOutput:
        return AIAnalysisOutput(
            summary="Executive summary from a test provider.",
            findings=["Market insight"],
            recommendations=["Launch a pilot", "Track conversion"],
            risks=["Risk: demand uncertainty"],
            assumptions=["Demand remains stable"],
            confidence=0.8,
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


def test_unreadable_pdf_is_reported_without_raising() -> None:
    result = extract_document("broken.pdf", b"not a valid PDF", 1024)

    assert result.status == "failed"
    assert result.error is not None


def test_pdf_extraction_uses_page_text(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakePage:
        def extract_text(self) -> str:
            return "Pune fleet utilization increased."

    class FakeReader:
        pages = [FakePage()]

        def __init__(self, _: object) -> None:
            pass

    monkeypatch.setattr(document_service, "PdfReader", FakeReader)
    result = extract_document("report.pdf", b"valid-test-content", 1024)

    assert result.status == "success"
    assert result.text == "Pune fleet utilization increased."


def test_document_limit_records_truncation() -> None:
    document = DocumentExtraction(
        filename="large.txt",
        file_type="txt",
        text="A" * 200,
        character_count=200,
        original_character_count=200,
        status="success",
    )

    result = limit_document_text(document, 100)

    assert result.truncated is True
    assert "[Document content truncated]" in result.text
    assert result.original_character_count == 200


def test_missing_gemini_key_returns_safe_error() -> None:
    with pytest.raises(AIProviderError, match="Gemini is not configured"):
        asyncio.run(GeminiProvider(api_key=None, model="gemini-2.5-flash").generate("system", "user"))


def test_report_response_contains_frontend_fields() -> None:
    result = asyncio.run(AgentOrchestrator(provider=FakeProvider()).run(_context(), "EcoRide Mobility"))

    assert result.status == "completed"
    assert result.business_summary.startswith("EcoRide Mobility")
    assert result.executive_summary == "Executive summary from a test provider."
    assert result.key_opportunities
    assert result.action_plan.immediate_actions
    assert result.assumptions == ["Demand remains stable"] * 6
    assert result.context_metadata.successful_documents == 0


def test_json_cleaner_strips_markdown_fences() -> None:
    markdown_json = "```json\n{\n  \"summary\": \"Test summary\"\n}\n```"
    cleaned = GeminiProvider._clean_json_text(markdown_json)
    assert cleaned.startswith("{")
    assert cleaned.endswith("}")


def test_json_object_extractor_isolates_nested_object() -> None:
    prose_json = "Here is the response:\n{\n  \"summary\": \"Direct answer\"\n}\nHope this helps."
    extracted = GeminiProvider._extract_json_object(prose_json)
    assert extracted == "{\n  \"summary\": \"Direct answer\"\n}"
