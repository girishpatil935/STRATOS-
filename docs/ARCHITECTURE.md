# Architecture

## Current architecture

The current foundation is a single FastAPI application. `app.main` creates the application and registers versioned routes. `app.core.config` loads environment-based settings using pydantic-settings, including the maximum per-file upload size. `app.core.logging` emits JSON-formatted logs, and `app.main` provides the global handler for unexpected exceptions.

The context endpoint follows this flow: User Input -> File Validation -> Document Extraction -> Context Builder -> Structured Business Context -> Future Multi-Agent System. `document_service.py` validates and extracts TXT, DOCX, and PDF text. `context_service.py` combines the business question, optional description, and successful extractions. Document extraction failures remain visible in the per-document result without crashing the full request.

## Planned architecture

`AgentOrchestrator` now runs Research, Market Analysis, Finance, Risk Assessment, Legal & Compliance, and Strategy Planning agents sequentially. Every agent implements `BaseAgent` and returns the shared `AgentResult` contract. The orchestrator isolates a failed agent, records its failure result, and continues where possible. Strategy Planning receives the previous specialist results and synthesizes their summaries.

Agents delegate generation to `services/ai/BaseAIProvider`, rather than calling a model SDK directly. `GeminiProvider` uses the official `google-genai` SDK with a Pydantic response schema and JSON-mode output. `context_formatter.py` formats and bounds BusinessContext before every provider request. The factory currently selects Gemini and provides a narrow extension point for OpenAI, Anthropic, OpenRouter, or local providers later.

The orchestrator remains sequential and async-compatible. Strategy Planning receives both completed and failed specialist results so it can identify unavailable analysis rather than fabricate it.

This remains a modular monolith for the MVP. No database, queue, cache, authentication layer, vector store, or distributed services are currently planned.
