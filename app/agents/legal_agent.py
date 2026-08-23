"""Legal and compliance specialist agent."""

from app.agents.base import BaseAgent


class LegalComplianceAgent(BaseAgent):
    agent_name = "Legal & Compliance Agent"
    agent_role = "legal_compliance"
    description = "Highlights general regulatory, privacy, and data-handling considerations."
    analysis_instructions = """Identify general regulatory, data privacy, licensing, and compliance considerations.
Provide max 3 compliance findings, max 3 recommendations, and max 3 regulatory risks."""
