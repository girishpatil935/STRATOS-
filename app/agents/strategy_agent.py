"""Strategy-planning specialist agent."""

from app.core.config import get_settings
from app.agents.base import BaseAgent


class StrategyPlanningAgent(BaseAgent):
    agent_name = "Strategy Planning Agent"
    agent_role = "strategy_planning"
    description = "Synthesizes specialist insights into an actionable strategic plan."
    uses_previous_results = True

    def __init__(self, provider=None) -> None:
        super().__init__(provider)
        self.max_output_tokens = get_settings().gemini_strategy_max_output_tokens

    analysis_instructions = """Synthesize the specialist outputs into an executive decision summary.
Do NOT perform new research.
- summary: max 2-3 sentences.
- recommendations: max 3 top strategic priorities and immediate next steps.
- risks: max 3 primary strategic risks.
- findings: max 3 synthesized strategic takeaways."""
