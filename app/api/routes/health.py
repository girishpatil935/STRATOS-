"""Health-check routes."""

from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.responses import HealthResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Confirm the API is available."""
    settings = get_settings()
    return HealthResponse(
        status="healthy",
        service=settings.app_name,
        environment=settings.app_env,
    )
