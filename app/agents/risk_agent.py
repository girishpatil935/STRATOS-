"""Risk-assessment specialist agent."""

from app.agents.base import BaseAgent


class RiskAssessmentAgent(BaseAgent):
    agent_name = "Risk Assessment Agent"
    agent_role = "risk_assessment"
    description = "Assesses operational, financial, market, strategic, and implementation risks."
    analysis_instructions = """Identify critical operational, execution, market, and strategic risks.
Provide max 3 critical risks with concise mitigation notes, max 3 findings, and max 3 recommendations."""
