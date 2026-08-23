"""Build normalized business context from submitted inputs and documents."""

from app.schemas.research import BusinessContext, ContextMetadata, DocumentSummary
from app.core.config import get_settings
from app.services.document_service import DocumentExtraction, limit_document_text


def build_business_context(
    business_question: str,
    business_description: str | None,
    documents: list[DocumentExtraction],
) -> BusinessContext:
    """Combine submitted fields and successful extraction results."""
    settings = get_settings()
    prepared_documents = [
        limit_document_text(document, settings.max_document_context_chars) for document in documents
    ]
    summaries = [
        DocumentSummary(
            filename=document.filename,
            file_type=document.file_type,
            character_count=document.character_count,
            status=document.status,
            extracted_characters=document.original_character_count,
            extraction_status=document.status,
            preview=document.preview,
            truncated=document.truncated,
            error=document.error,
        )
        for document in prepared_documents
    ]
    successful_documents = [document for document in prepared_documents if document.status == "success"]
    sections = [f"Business Question:\n{business_question.strip()}"]
    if business_description and business_description.strip():
        sections.append(f"Business Description:\n{business_description.strip()}")
    for document in successful_documents:
        sections.append(f"Document: {document.filename}\n{document.text}")

    return BusinessContext(
        business_question=business_question.strip(),
        business_description=business_description.strip() if business_description else None,
        documents=summaries,
        combined_context="\n\n".join(sections),
        metadata=ContextMetadata(
            number_of_documents=len(prepared_documents),
            successful_documents=len(successful_documents),
            failed_documents=len(prepared_documents) - len(successful_documents),
            total_character_count=sum(document.character_count for document in successful_documents),
            truncated_documents=sum(document.truncated for document in prepared_documents),
        ),
    )
