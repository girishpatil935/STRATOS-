"""Centralized workflow state, idempotency, execution locking, and persistence service."""

import hashlib
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from app.agents.orchestrator import AgentOrchestrator
from app.core.logging import get_logger
from app.schemas.research import AgentResult, BusinessContext, RunAnalysisRequest, RunAnalysisResponse
from app.services.ai.base import QuotaExhaustedError
from app.services.ai.gemini import GeminiProvider
from app.services.report_service import build_executive_report

logger = get_logger(__name__)


class WorkflowService:
    """In-memory workflow manager providing idempotency, execution locking, and retry management."""

    _instance: "WorkflowService | None" = None

    def __new__(cls) -> "WorkflowService":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._workflows = {}
            cls._instance._stored_contexts = {}
            cls._instance._context_hash_map = {}
            cls._instance._active_locks = set()
        return cls._instance

    @staticmethod
    def compute_context_hash(context: BusinessContext, business_name: str | None) -> str:
        """Compute a deterministic hash for a given business context and name."""
        biz_name = (business_name or "").strip().lower()
        question = context.business_question.strip().lower()
        desc = (context.business_description or "").strip().lower()
        raw = f"{biz_name}|||{question}|||{desc}"
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get_workflow(self, analysis_id: str) -> RunAnalysisResponse | None:
        """Retrieve an existing workflow by its analysis ID."""
        return self._workflows.get(analysis_id)

    def get_stored_context(self, analysis_id: str) -> BusinessContext | None:
        """Retrieve the original BusinessContext for an analysis ID."""
        return self._stored_contexts.get(analysis_id)

    def get_existing_workflow_for_context(
        self, context: BusinessContext, business_name: str | None
    ) -> RunAnalysisResponse | None:
        """Return an existing workflow for identical context if available."""
        ctx_hash = self.compute_context_hash(context, business_name)
        existing_id = self._context_hash_map.get(ctx_hash)
        if existing_id:
            return self._workflows.get(existing_id)
        return None

    def create_workflow_placeholder(
        self, request: RunAnalysisRequest, force_new: bool = False
    ) -> tuple[RunAnalysisResponse, bool]:
        """Get an active running workflow or create a new pending placeholder."""
        ctx_hash = self.compute_context_hash(request.context, request.business_name)

        if force_new:
            GeminiProvider.clear_cache_and_reset()
        else:
            existing_id = self._context_hash_map.get(ctx_hash)
            if existing_id and existing_id in self._workflows:
                existing = self._workflows[existing_id]
                if existing.status.lower() in ("running", "pending"):
                    logger.info(
                        "[TRACE] Active running workflow hit (id=%s, status=%s). Returning running workflow.",
                        existing.analysis_id,
                        existing.status,
                    )
                    return existing, False

        # Create brand-new workflow for a fresh analysis
        new_id = str(uuid4())
        placeholder = build_executive_report(
            analysis_id=new_id,
            business_name=request.business_name,
            agent_results=[],
            created_at=datetime.now(UTC).isoformat(),
            execution_metadata={"execution_mode": "sequential", "successful_agents": 0, "failed_agents": 0},
            context=request.context,
        )
        placeholder.status = "RUNNING"
        placeholder.overall_status = "failed"

        self._workflows[new_id] = placeholder
        self._stored_contexts[new_id] = request.context
        self._context_hash_map[ctx_hash] = new_id
        logger.info("[TRACE] workflow created: %s", new_id)
        return placeholder, True

    async def execute_workflow(
        self,
        analysis_id: str,
        context: BusinessContext,
        business_name: str | None,
        retry_only_failed: bool = False,
    ) -> RunAnalysisResponse:
        """Execute or retry a workflow under a strict execution lock."""
        logger.info("[TRACE] background execution scheduled for workflow %s", analysis_id)
        if analysis_id in self._active_locks:
            logger.warning("Workflow %s is already executing. Rejecting duplicate concurrent request.", analysis_id)
            existing = self._workflows.get(analysis_id)
            if existing:
                return existing
            raise RuntimeError(f"Workflow {analysis_id} is already in progress.")

        # Acquire lock
        self._active_locks.add(analysis_id)
        logger.info("[TRACE] execution lock acquired for workflow %s", analysis_id)
        existing_workflow = self._workflows.get(analysis_id)
        if existing_workflow:
            existing_workflow.status = "RUNNING"

        try:
            import app.api.routes.analysis as analysis_route
            orchestrator_cls = getattr(analysis_route, "AgentOrchestrator", AgentOrchestrator)
            orchestrator = orchestrator_cls()
            existing_results = existing_workflow.agent_results if existing_workflow else None
            response = await orchestrator.run(
                context=context,
                business_name=business_name,
                analysis_id=analysis_id,
                existing_results=existing_results,
                retry_only_failed=retry_only_failed,
            )
            logger.info("[TRACE] orchestrator returned for workflow %s (status=%s)", analysis_id, response.status)

            # Check if any quota exhaustion occurred
            has_quota_error = any(
                r.metadata.get("error_type") == "QuotaExhaustedError" or "quota" in (r.error or "").lower()
                for r in response.agent_results
            )
            if has_quota_error and response.status in ("failed", "partial"):
                response.status = "QUOTA_EXHAUSTED"

            self._workflows[analysis_id] = response
            self._stored_contexts[analysis_id] = context
            logger.info("Successfully finished executing workflow %s (status=%s)", analysis_id, response.status)
            return response
        except QuotaExhaustedError as quota_err:
            logger.error("Quota protection triggered during workflow %s: %s", analysis_id, quota_err)
            if existing_workflow:
                existing_workflow.status = "QUOTA_EXHAUSTED"
                existing_workflow.metadata["error_detail"] = str(quota_err)
                return existing_workflow
            raise
        finally:
            self._active_locks.discard(analysis_id)
            logger.info("[TRACE] execution lock released for workflow %s", analysis_id)


def get_workflow_service() -> WorkflowService:
    """Return singleton WorkflowService instance."""
    return WorkflowService()
