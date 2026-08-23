# Project Context

Executive_AI is an AI-powered multi-agent executive decision intelligence platform, designed as a fast, demonstrable hackathon prototype. A business owner will provide a strategic question, written business context, and optionally PDF, DOCX, or TXT source documents.

The intended product will combine internal company context (revenue, expenses, budget, offerings, customers, strategy material, and financial reports) with external information (market research, competitors, trends, regulation, risks, and opportunities).

Six planned agents serve distinct responsibilities: Research collects reliable, source-backed findings; Market Analysis evaluates market size, trends, competitors, demand, opportunities, and gaps; Finance considers cost, revenue, feasibility, and ROI; Risk Assessment identifies and mitigates technical, market, financial, operational, and dependency risks; Legal & Compliance reviews regulatory, privacy, compliance, and IP considerations; and Strategy Planning synthesizes the other outputs into an executive decision, trade-offs, recommendations, and next actions.

Legal & Compliance output must always be framed as informational analysis, not professional legal advice. The MVP favors a working end-to-end demo, clean modularity, easy debugging, and easy handoff over enterprise infrastructure.

## Prompt 5: Demo-ready backend

The input-processing pipeline accepts a required business question, optional business description, and optional PDF, DOCX, or TXT documents. `document_service.py` validates and extracts text, normalizes it, records previews, and marks unreadable documents as failures without stopping the request. `context_service.py` bounds each successful document while preserving its start and end, records truncation metadata, and constructs the BusinessContext used by agents.

The current architecture is a FastAPI modular monolith. `GET /` reports service availability, `GET /api/v1/health` reports health, `/api/v1/research/context` creates BusinessContext from multipart data, and `/api/v1/analysis/run` sends prepared context to a sequential AgentOrchestrator. Six specialized agents use BaseAgent and a centralized `BaseAIProvider`; the factory selects GeminiProvider, which uses structured JSON output through the official Google GenAI SDK. The Strategy Planning Agent receives previous agent results, including failures. CORS is configured through the `CORS_ORIGINS` environment variable for frontend handoff.

The analysis response contains raw per-agent results plus a stable executive report: status, business-context metadata, business and executive summaries, opportunities, critical risks, market/financial/compliance insight lists, strategy, action plan, KPIs, assumptions, and timestamps. Individual failure does not terminate the run; status becomes `partial` where usable output remains, or `failed` when none is available.

The demo workflow is: create context with text and files, surface document previews/errors, submit the returned context to analysis, and render the executive report plus individual agent cards. `examples/ecoride_analysis_request.json` and `examples/ecoride_mobility_notes.txt` provide a fictional EcoRide Mobility scenario.

Known limitations: no external research or citations, no retries or asynchronous parallelization, no persistence, and no OCR for scanned PDFs. The legal result remains informational only and not professional legal advice. The next recommended phase is source-backed research tooling for the Research Agent.
