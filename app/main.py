"""FastAPI application entry point."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.analysis import router as analysis_router
from app.api.routes.health import router as health_router
from app.api.routes.research import router as research_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.schemas.responses import RootResponse

settings = get_settings()
configure_logging(settings.debug)
logger = get_logger(__name__)

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    version="0.1.0",
    description="Backend foundation for STRATOS.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router, prefix="/api/v1")
app.include_router(research_router, prefix="/api/v1")
app.include_router(analysis_router, prefix="/api/v1")


@app.get("/", response_model=RootResponse, tags=["system"])
async def root() -> RootResponse:
    """Return the service status."""
    return RootResponse(
        name=settings.app_name,
        status="running",
        message="STRATOS backend is operational",
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Log unexpected errors and return a safe API response."""
    logger.exception("Unhandled exception on %s", request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred."},
    )
