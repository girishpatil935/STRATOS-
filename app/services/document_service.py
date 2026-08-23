"""Validation and text extraction for uploaded business documents."""

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from docx import Document
from pypdf import PdfReader

SUPPORTED_FILE_TYPES = {".pdf": "pdf", ".docx": "docx", ".txt": "txt"}


class DocumentValidationError(ValueError):
    """Raised when an uploaded file is not valid for processing."""


@dataclass
class DocumentExtraction:
    """The internal result of processing one uploaded document."""

    filename: str
    file_type: str
    text: str
    character_count: int
    status: str
    original_character_count: int = 0
    preview: str | None = None
    truncated: bool = False
    error: str | None = None


def validate_document(filename: str | None, content: bytes, max_size_bytes: int) -> str:
    """Validate file name, type, size, and non-empty content."""
    safe_filename = filename or ""
    extension = Path(safe_filename).suffix.lower()
    if extension not in SUPPORTED_FILE_TYPES:
        allowed = ", ".join(SUPPORTED_FILE_TYPES)
        raise DocumentValidationError(
            f"Unsupported file type for '{safe_filename or 'unnamed file'}'. "
            f"Allowed types: {allowed}."
        )
    if not content:
        raise DocumentValidationError(f"File '{safe_filename}' is empty.")
    if len(content) > max_size_bytes:
        raise DocumentValidationError(
            f"File '{safe_filename}' exceeds the maximum upload size of "
            f"{max_size_bytes} bytes."
        )
    return SUPPORTED_FILE_TYPES[extension]


def extract_document(filename: str | None, content: bytes, max_size_bytes: int) -> DocumentExtraction:
    """Extract text from a validated file, retaining per-document failures."""
    file_type = validate_document(filename, content, max_size_bytes)
    safe_filename = filename or "unnamed file"
    try:
        if file_type == "pdf":
            text = _extract_pdf(content)
        elif file_type == "docx":
            text = _extract_docx(content)
        else:
            text = _extract_txt(content)
    except Exception as exc:  # Parser errors should not discard other documents.
        return DocumentExtraction(
            filename=safe_filename,
            file_type=file_type,
            text="",
            character_count=0,
            status="failed",
            error=f"Could not extract text: {exc}",
        )

    cleaned_text = normalize_document_text(text)
    if not cleaned_text:
        return DocumentExtraction(
            filename=safe_filename,
            file_type=file_type,
            text="",
            character_count=0,
            status="failed",
            error="No readable text could be extracted from this document.",
        )
    return DocumentExtraction(
        filename=safe_filename,
        file_type=file_type,
        text=cleaned_text,
        character_count=len(cleaned_text),
        original_character_count=len(cleaned_text),
        preview=create_preview(cleaned_text),
        status="success",
    )


def normalize_document_text(text: str) -> str:
    """Normalize whitespace while retaining logical paragraph breaks."""
    return "\n".join(" ".join(line.split()) for line in text.splitlines() if line.strip()).strip()


def create_preview(text: str, max_chars: int = 500) -> str:
    """Return a compact preview for metadata and frontend inspection."""
    return text[:max_chars].rstrip() + ("..." if len(text) > max_chars else "")


def limit_document_text(document: DocumentExtraction, max_chars: int) -> DocumentExtraction:
    """Bound one document while preserving useful beginning and ending context."""
    if document.status != "success" or len(document.text) <= max_chars:
        return document
    head_chars = max_chars * 2 // 3
    tail_chars = max_chars - head_chars
    document.text = (
        document.text[:head_chars].rstrip()
        + "\n\n[Document content truncated]\n\n"
        + document.text[-tail_chars:].lstrip()
    )
    document.character_count = len(document.text)
    document.truncated = True
    return document


def _extract_pdf(content: bytes) -> str:
    reader = PdfReader(BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages).strip()


def _extract_docx(content: bytes) -> str:
    document = Document(BytesIO(content))
    return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()


def _extract_txt(content: bytes) -> str:
    return content.decode("utf-8", errors="replace").strip()
