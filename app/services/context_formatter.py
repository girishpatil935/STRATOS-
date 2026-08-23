"""Format structured business context consistently and concisely for AI providers."""

from app.core.config import get_settings
from app.schemas.research import BusinessContext


def format_business_context(context: BusinessContext, business_name: str | None = None) -> str:
    """Produce bounded, compact context without duplicating core fields or bloating prompts."""
    sections = []
    if business_name:
        sections.append(f"BUSINESS NAME: {business_name.strip()}")
    sections.append(f"BUSINESS QUESTION: {context.business_question.strip()}")
    if context.business_description and context.business_description.strip():
        sections.append(f"BUSINESS DETAILS:\n{context.business_description.strip()}")

    # Add compact document summary if available
    supporting_context = _extract_compact_support(context)
    if supporting_context:
        sections.append(f"SUPPORTING DATA:\n{supporting_context}")

    formatted = "\n\n".join(sections)
    max_chars = get_settings().max_llm_context_chars
    if len(formatted) > max_chars:
        return formatted[:max_chars] + "..."
    return formatted


def _extract_compact_support(context: BusinessContext) -> str:
    """Extract clean, non-duplicate supporting context capped at compact size."""
    if not context.combined_context:
        return ""
    remaining = context.combined_context.strip()
    prefixes = [f"Business Question:\n{context.business_question.strip()}"]
    if context.business_description:
        prefixes.append(f"Business Description:\n{context.business_description.strip()}")
    for prefix in prefixes:
        if remaining.startswith(prefix):
            remaining = remaining[len(prefix) :].lstrip()
    # Keep only first 1200 characters of supporting text
    return remaining[:1200].strip()
