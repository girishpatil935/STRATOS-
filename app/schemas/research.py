"""Schemas for the business-context processing workflow."""

from typing import Any, Literal

from pydantic import BaseModel, Field


class DocumentSummary(BaseModel):
    """Safe document metadata returned by the context endpoint."""

    filename: str
    file_type: str
    character_count: int
    status: str
    extracted_characters: int | None = None
    extraction_status: str | None = None
    preview: str | None = None
    truncated: bool = False
    error: str | None = None


class ContextMetadata(BaseModel):
    """Useful processing totals for the MVP response."""

    number_of_documents: int
    successful_documents: int
    failed_documents: int
    total_character_count: int
    truncated_documents: int = 0


class BusinessContext(BaseModel):
    """Normalized input ready for a future multi-agent workflow."""

    business_question: str
    business_description: str | None = None
    documents: list[DocumentSummary]
    combined_context: str
    metadata: ContextMetadata


class BusinessContextResponse(BaseModel):
    success: bool
    message: str
    data: BusinessContext


class AgentResult(BaseModel):
    """Standard result returned by every specialist agent."""

    agent_name: str
    status: Literal["completed", "failed", "skipped", "not_started"]
    summary: str
    findings: list[str]
    recommendations: list[str]
    risks: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    confidence: float | None = None
    error: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class AIAnalysisOutput(BaseModel):
    """Schema requested from an AI provider for a specialist analysis."""

    summary: str
    findings: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    confidence: float | None = Field(default=None, ge=0, le=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class RunAnalysisRequest(BaseModel):
    """Request for a complete multi-agent analysis of prepared context."""

    context: BusinessContext
    business_name: str | None = None


class RunAnalysisResponse(BaseModel):
    """Combined output of an orchestrated analysis run."""

    workflow_id: str
    analysis_id: str
    business_name: str | None = None
    overall_status: Literal["completed", "completed_with_failures"]
    status: Literal[
        "CREATED",
        "RUNNING",
        "COMPLETED",
        "PARTIAL",
        "FAILED",
        "QUOTA_EXHAUSTED",
        "completed",
        "partial",
        "failed",
        "quota_exceeded",
        "pending",
        "running",
    ]
    context_metadata: ContextMetadata
    business_summary: str
    executive_summary: str
    key_opportunities: list["Opportunity"] = Field(default_factory=list)
    critical_risks: list["CriticalRisk"] = Field(default_factory=list)
    market_insights: list[str] = Field(default_factory=list)
    financial_insights: list[str] = Field(default_factory=list)
    compliance_considerations: list[str] = Field(default_factory=list)
    strategic_recommendations: list[str] = Field(default_factory=list)
    action_plan: "ActionPlan"
    recommended_kpis: list[str] = Field(default_factory=list)
    assumptions: list[str] = Field(default_factory=list)
    agent_results: list[AgentResult]
    created_at: str
    metadata: dict[str, Any]


class Opportunity(BaseModel):
    title: str
    description: str
    priority: Literal["high", "medium", "low"] = "medium"


class CriticalRisk(BaseModel):
    title: str
    description: str
    severity: Literal["high", "medium", "low"] = "medium"
    mitigation: str | None = None


class ActionPlan(BaseModel):
    immediate_actions: list[str] = Field(default_factory=list)
    short_term_actions: list[str] = Field(default_factory=list)
    medium_term_strategy: list[str] = Field(default_factory=list)
