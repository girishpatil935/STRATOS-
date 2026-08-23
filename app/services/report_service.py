"""Build a stable executive-report contract from agent analysis results."""

from app.schemas.research import (
    ActionPlan,
    AgentResult,
    BusinessContext,
    CriticalRisk,
    Opportunity,
    RunAnalysisResponse,
)


def build_executive_report(
    *,
    analysis_id: str,
    business_name: str | None,
    agent_results: list[AgentResult],
    created_at: str,
    execution_metadata: dict[str, int | str],
    context: BusinessContext,
) -> RunAnalysisResponse:
    """Map specialist results to a predictable frontend-ready report shape."""
    by_name = {result.agent_name: result for result in agent_results}
    strategy = by_name.get("Strategy Planning Agent")
    completed = [result for result in agent_results if result.status == "completed"]
    if not completed:
        status = "failed"
    elif len(completed) == len(agent_results):
        status = "completed"
    else:
        status = "partial"

    recommendations = strategy.recommendations if strategy and strategy.status == "completed" else []
    risk_agent = by_name.get("Risk Assessment Agent")
    return RunAnalysisResponse(
        workflow_id=analysis_id,
        analysis_id=analysis_id,
        business_name=business_name,
        overall_status="completed" if status == "completed" else "completed_with_failures",
        status=status,
        context_metadata=context.metadata,
        business_summary=_business_summary(context, business_name),
        executive_summary=_executive_summary(strategy, completed, context),
        key_opportunities=_opportunities(recommendations),
        critical_risks=_critical_risks(agent_results, risk_agent),
        market_insights=_findings(by_name.get("Market Analysis Agent")),
        financial_insights=_findings(by_name.get("Finance Agent")),
        compliance_considerations=_findings(by_name.get("Legal & Compliance Agent")),
        strategic_recommendations=recommendations,
        action_plan=_action_plan(recommendations),
        recommended_kpis=_recommended_kpis(),
        assumptions=[assumption for result in completed for assumption in result.assumptions],
        agent_results=agent_results,
        created_at=created_at,
        metadata=execution_metadata,
    )


def _business_summary(context: BusinessContext, business_name: str | None) -> str:
    name = f"{business_name}: " if business_name else ""
    description = context.business_description or "No additional business description was provided."
    return f"{name}{description} Business question: {context.business_question}"


def _executive_summary(
    strategy: AgentResult | None, completed: list[AgentResult], context: BusinessContext
) -> str:
    if strategy and strategy.status == "completed":
        return strategy.summary
    if completed:
        return completed[0].summary
    return f"Analysis could not be completed for: {context.business_question}"


def _opportunities(recommendations: list[str]) -> list[Opportunity]:
    return [
        Opportunity(title=recommendation[:80], description=recommendation, priority="medium")
        for recommendation in recommendations[:5]
    ]


def _critical_risks(
    agent_results: list[AgentResult], risk_agent: AgentResult | None
) -> list[CriticalRisk]:
    mitigation = (
        risk_agent.recommendations[0]
        if risk_agent and risk_agent.status == "completed" and risk_agent.recommendations
        else None
    )
    risks = []
    for result in agent_results:
        if result.status == "completed":
            risks.extend(
                CriticalRisk(
                    title=result.agent_name,
                    description=risk,
                    severity="medium",
                    mitigation=mitigation,
                )
                for risk in result.risks
            )
    return risks[:8]


def _findings(result: AgentResult | None) -> list[str]:
    return result.findings if result and result.status == "completed" else []


def _action_plan(recommendations: list[str]) -> ActionPlan:
    return ActionPlan(
        immediate_actions=recommendations[:2],
        short_term_actions=recommendations[2:4],
        medium_term_strategy=recommendations[4:6],
    )


def _recommended_kpis() -> list[str]:
    return [
        "Revenue growth",
        "Customer acquisition cost",
        "Customer retention rate",
        "Operating margin",
        "Milestone completion rate",
    ]
