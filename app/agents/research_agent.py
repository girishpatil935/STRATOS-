"""Research specialist agent."""

from app.agents.base import BaseAgent


class ResearchAgent(BaseAgent):
    agent_name = "Research Agent"
    agent_role = "research"
    description = "Analyzes industry context, trends, competitors, and information gaps."
    analysis_instructions = """Analyze industry trends, competitor landscape, and key information gaps.
Provide max 3 key findings, max 3 recommendations, and max 3 risks."""
