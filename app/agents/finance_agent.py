"""Finance specialist agent."""

from app.agents.base import BaseAgent


class FinanceAgent(BaseAgent):
    agent_name = "Finance Agent"
    agent_role = "finance"
    description = "Analyzes financial feasibility, constraints, and resource allocation."
    analysis_instructions = """Analyze budget, costs, unit economics, and capital allocation.
Provide max 3 financial findings, max 3 recommendations, and max 3 financial risks. Never invent figures."""
