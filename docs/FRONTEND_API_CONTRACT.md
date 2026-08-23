# Frontend API Contract

This document is the frontend handoff for Executive_AI. The backend is stateless: the frontend holds the returned `BusinessContext` in memory (or its own draft store) and sends it to analysis. There is no server-side `context_id` or persistence yet.

## Base URL and CORS

Local backend: `http://127.0.0.1:8000` (also usable as `http://localhost:8000`). Configure the frontend through an environment variable such as `VITE_API_BASE_URL=http://127.0.0.1:8000`.

The backend allows `http://localhost:3000` and `http://127.0.0.1:3000` by default. For an Antigravity, Vite, preview, or deployed frontend, set the backend `CORS_ORIGINS` environment variable to a comma-separated list of exact frontend origins, then restart the backend. Do not use wildcard origins for production deployments.

## Endpoints

### `GET /`

Purpose: lightweight service check. No request body.

```json
{
  "name": "Executive_AI",
  "status": "running",
  "message": "Executive_AI backend is operational"
}
```

### `GET /api/v1/health`

Purpose: readiness/health display. No request body.

```json
{
  "status": "healthy",
  "service": "Executive_AI",
  "environment": "development"
}
```

### `POST /api/v1/research/context`

Purpose: normalize the user's business input and uploaded documents. Content type must be `multipart/form-data`.

| Form field | Required | Type | Notes |
| --- | --- | --- | --- |
| `business_question` | Yes | string | The strategic decision to analyze. |
| `business_description` | No | string | Put all structured form inputs here as readable labeled text when no dedicated field exists. |
| `files` | No | repeated file | TXT, PDF, or DOCX only. |

React-style request shape:

```ts
const form = new FormData();
form.append("business_question", question);
form.append("business_description", labeledBusinessDetails);
selectedFiles.forEach((file) => form.append("files", file));
const response = await fetch(`${API_BASE_URL}/api/v1/research/context`, {
  method: "POST",
  body: form
});
```

Successful response:

```json
{
  "success": true,
  "message": "Business context created successfully",
  "data": {
    "business_question": "Should EcoRide expand to Mumbai and Bengaluru?",
    "business_description": "Industry: electric mobility...",
    "documents": [{
      "filename": "notes.txt",
      "file_type": "txt",
      "character_count": 420,
      "extracted_characters": 520,
      "extraction_status": "success",
      "preview": "EcoRide Mobility is...",
      "truncated": true,
      "error": null
    }],
    "combined_context": "Business Question: ...",
    "metadata": {
      "number_of_documents": 1,
      "successful_documents": 1,
      "failed_documents": 0,
      "total_character_count": 420,
      "truncated_documents": 1
    }
  }
}
```

Errors: unsupported, empty, or oversized files return `400` with `{ "detail": "..." }`. Missing/invalid required form input returns `422`. Document parsing failures remain in `data.documents[]` with `status`/`extraction_status` set to `failed`; the frontend should show the error and still allow analysis of remaining context.

### `POST /api/v1/analysis/run`

Purpose: run Research, Market, Finance, Risk, Legal & Compliance, and Strategy Planning agents. Content type: `application/json`.

```json
{
  "business_name": "EcoRide Mobility",
  "context": {
    "business_question": "Should EcoRide expand to Mumbai and Bengaluru?",
    "business_description": "Industry: electric mobility. Budget: INR 2 crore.",
    "documents": [],
    "combined_context": "Business Question: ...",
    "metadata": {
      "number_of_documents": 0,
      "successful_documents": 0,
      "failed_documents": 0,
      "total_character_count": 0,
      "truncated_documents": 0
    }
  }
}
```

Pass the previous context response unchanged: `{ business_name, context: contextResponse.data }`. A complete fixture is [examples/ecoride_analysis_request.json](../examples/ecoride_analysis_request.json).

Important response fields:

```json
{
  "analysis_id": "uuid",
  "business_name": "EcoRide Mobility",
  "status": "completed",
  "overall_status": "completed",
  "context_metadata": { "number_of_documents": 0, "truncated_documents": 0 },
  "business_summary": "...",
  "executive_summary": "...",
  "key_opportunities": [{ "title": "...", "description": "...", "priority": "medium" }],
  "critical_risks": [{ "title": "...", "description": "...", "severity": "medium", "mitigation": "..." }],
  "market_insights": [],
  "financial_insights": [],
  "compliance_considerations": [],
  "strategic_recommendations": [],
  "action_plan": { "immediate_actions": [], "short_term_actions": [], "medium_term_strategy": [] },
  "recommended_kpis": [],
  "assumptions": [],
  "agent_results": [],
  "created_at": "2026-08-18T00:00:00+00:00",
  "metadata": { "execution_mode": "sequential", "successful_agents": 6, "failed_agents": 0 }
}
```

`status` is `completed`, `partial`, or `failed`. Every `agent_results[]` item contains `agent_name`, `status` (`completed` or `failed`), `summary`, arrays for insights/recommendations/risks/assumptions, nullable `confidence`, nullable user-safe `error`, and safe metadata. Never assume an array has content during a partial run.

## Required frontend workflow

1. Collect business name, industry, product/service, target customer, revenue/budget, team, competition, goals, challenge, and location fields.
2. Build a labeled `business_description` from those inputs and submit it with the question and optional documents to `/api/v1/research/context`.
3. Display document previews, failed extraction messages, and truncation notice before proceeding.
4. Retain `response.data` in the page state; it is the context object for the next call.
5. Submit `{ business_name, context: response.data }` to `/api/v1/analysis/run`.
6. Show loading/progress state while analysis is running: agents execute sequentially and a live call can take up to several per-agent provider timeouts.
7. Render executive summary, opportunities, risks, market, finance, compliance, recommendations, action plan, KPIs, assumptions, and individual agent cards.
8. For `partial`, show all available content plus a non-blocking per-agent failure banner. For `failed`, show the safe error messages and offer retry after checking configuration/network.

Do not place API keys in the frontend. The browser communicates only with this backend; Gemini credentials remain server-side.
