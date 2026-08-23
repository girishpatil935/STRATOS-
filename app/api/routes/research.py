"""Business-context creation endpoint."""

from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.schemas.research import BusinessContextResponse
from app.services.context_service import build_business_context
from app.services.document_service import DocumentValidationError, extract_document

router = APIRouter(prefix="/research", tags=["research"])


@router.post("/context", response_model=BusinessContextResponse)
async def create_business_context(
    business_question: Annotated[str, Form(min_length=1)],
    business_description: Annotated[str | None, Form()] = None,
    files: Annotated[list[UploadFile] | None, File()] = None,
) -> BusinessContextResponse:
    """Validate uploads and prepare normalized context for future agents."""
    settings = get_settings()
    extractions = []
    for file in files or []:
        content = await file.read()
        try:
            extractions.append(
                extract_document(file.filename, content, settings.max_upload_size_bytes)
            )
        except DocumentValidationError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        finally:
            await file.close()

    context = build_business_context(
        business_question=business_question,
        business_description=business_description,
        documents=extractions,
    )
    return BusinessContextResponse(
        success=True,
        message="Business context created successfully",
        data=context,
    )
