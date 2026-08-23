"""Market-analysis specialist agent."""

from app.agents.base import BaseAgent


class MarketAnalysisAgent(BaseAgent):
    agent_name = "Market Analysis Agent"
    agent_role = "market_analysis"
    description = "Analyzes target markets, customers, positioning, and growth opportunities."
    analysis_instructions = """Analyze target customers, market demand, positioning, and growth opportunities.
Provide max 3 key market findings, max 3 recommendations, and max 3 market risks."""
