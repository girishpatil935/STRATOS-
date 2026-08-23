"""Multi-agent analysis API routes with idempotency, state persistence, and selective retry."""

from fastapi import APIRouter, HTTPException, status

from app.agents.orchestrator import AgentOrchestrator
from app.core.logging import get_logger
from app.schemas.research import RunAnalysisRequest, RunAnalysisResponse
from app.services.workflow_service import get_workflow_service

logger = get_logger(__name__)
router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/run", response_model=RunAnalysisResponse)
async def run_analysis(request: RunAnalysisRequest) -> RunAnalysisResponse:
    """Run analysis on business context with duplicate request protection and idempotency."""
    logger.info("[TRACE] POST request received: /api/v1/analysis/run (business_name=%s)", request.business_name)
    service = get_workflow_service()
    logger.info("[TRACE] creating workflow placeholder")
    workflow, is_new = service.create_workflow_placeholder(request, force_new=False)
    if not is_new and workflow.status.lower() in ("running", "pending"):
        logger.info("[TRACE] returning active running workflow (id=%s)", workflow.analysis_id)
        return workflow

    logger.info("[TRACE] scheduling workflow execution (id=%s)", workflow.analysis_id)
    return await service.execute_workflow(
        analysis_id=workflow.analysis_id,
        context=request.context,
        business_name=request.business_name,
        retry_only_failed=False,
    )


@router.post("/new", response_model=RunAnalysisResponse)
async def create_new_analysis(request: RunAnalysisRequest) -> RunAnalysisResponse:
    """Explicitly start a brand new analysis workflow, bypassing previous context locks."""
    logger.info("[TRACE] POST request received: /api/v1/analysis/new (business_name=%s)", request.business_name)
    service = get_workflow_service()
    logger.info("[TRACE] creating new workflow placeholder")
    workflow, _ = service.create_workflow_placeholder(request, force_new=True)
    logger.info("[TRACE] scheduling new workflow execution (id=%s)", workflow.analysis_id)
    return await service.execute_workflow(
        analysis_id=workflow.analysis_id,
        context=request.context,
        business_name=request.business_name,
        retry_only_failed=False,
    )


@router.get("/{analysis_id}", response_model=RunAnalysisResponse)
async def get_analysis(analysis_id: str) -> RunAnalysisResponse:
    """Retrieve an existing workflow status and results by ID. Never triggers AI generation."""
    logger.info("[TRACE] GET request received: /api/v1/analysis/%s", analysis_id)
    service = get_workflow_service()
    workflow = service.get_workflow(analysis_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found.",
        )
    return workflow


@router.post("/{analysis_id}/retry-failed", response_model=RunAnalysisResponse)
async def retry_failed_agents(analysis_id: str) -> RunAnalysisResponse:
    """Retry ONLY previously failed agents for an existing workflow without re-running successful agents."""
    logger.info("[TRACE] POST request received: /api/v1/analysis/%s/retry-failed", analysis_id)
    service = get_workflow_service()
    workflow = service.get_workflow(analysis_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis with ID '{analysis_id}' was not found.",
        )

    if workflow.status.lower() in ("pending", "running"):
        logger.info("[TRACE] workflow %s is currently active, returning as-is", analysis_id)
        return workflow

    context = service.get_stored_context(analysis_id)
    if not context:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business context for this workflow was not found.",
        )

    logger.info("[TRACE] scheduling retry execution for workflow %s", analysis_id)
    return await service.execute_workflow(
        analysis_id=workflow.analysis_id,
        context=context,
        business_name=workflow.business_name,
        retry_only_failed=True,
    )
