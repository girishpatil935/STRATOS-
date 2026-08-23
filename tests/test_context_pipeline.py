from io import BytesIO

from docx import Document
from fastapi.testclient import TestClient

from app.main import app
from app.services.document_service import extract_document

client = TestClient(app)


def test_txt_extraction() -> None:
    extraction = extract_document("notes.txt", b"Customer retention is strong.", 1024)

    assert extraction.status == "success"
    assert extraction.file_type == "txt"
    assert extraction.text == "Customer retention is strong."


def test_docx_extraction() -> None:
    document = Document()
    document.add_paragraph("FY2026 revenue target")
    buffer = BytesIO()
    document.save(buffer)

    extraction = extract_document("plan.docx", buffer.getvalue(), 1024 * 1024)

    assert extraction.status == "success"
    assert extraction.file_type == "docx"
    assert "FY2026 revenue target" in extraction.text


def test_invalid_file_type_is_rejected() -> None:
    response = client.post(
        "/api/v1/research/context",
        data={"business_question": "Should we expand?"},
        files={"files": ("data.csv", b"metric,value", "text/csv")},
    )

    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_context_creation_without_documents() -> None:
    response = client.post(
        "/api/v1/research/context",
        data={
            "business_question": "Should we expand?",
            "business_description": "We are a profitable SaaS business.",
        },
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["metadata"] == {
        "number_of_documents": 0,
        "successful_documents": 0,
        "failed_documents": 0,
        "total_character_count": 0,
        "truncated_documents": 0,
    }
    assert "We are a profitable SaaS business." in data["combined_context"]


def test_context_creation_with_txt_document() -> None:
    response = client.post(
        "/api/v1/research/context",
        data={"business_question": "Should we expand?"},
        files={"files": ("market-notes.txt", b"Demand is growing in India.", "text/plain")},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["documents"][0]["status"] == "success"
    assert data["metadata"]["successful_documents"] == 1
    assert "Demand is growing in India." in data["combined_context"]
