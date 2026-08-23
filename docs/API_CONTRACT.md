# API Contract

Base URL: `http://127.0.0.1:8000`

## `GET /`

Returns backend availability.

```json
{
  "name": "Executive_AI",
  "status": "running",
  "message": "Executive_AI backend is operational"
}
```

## `GET /api/v1/health`

Returns service health and configured environment.

```json
{
  "status": "healthy",
  "service": "Executive_AI",
  "environment": "development"
}
```

## `POST /api/v1/research/context`

Creates normalized business context from multipart form inputs. It does not call an LLM or external service.

### Request (`multipart/form-data`)

| Field | Required | Description |
| --- | --- | --- |
| `business_question` | Yes | Non-empty strategic business question. |
| `business_description` | No | Additional company or business information. |
| `files` | No | One or more PDF, DOCX, or TXT files. |

Files must use `.pdf`, `.docx`, or `.txt` extensions. Each file must be non-empty and smaller than `MAX_UPLOAD_SIZE_BYTES` (10 MiB by default). Unsupported, empty, or oversized uploads return `400` with a clear `detail` message. A document parsing error is reported for that document in the successful response while other valid documents continue processing.

### Successful response (`200`)

```json
{
  "success": true,
  "message": "Business context created successfully",
  "data": {
    "business_question": "Should we expand into India?",
    "business_description": "We are a SaaS startup.",
    "documents": [{
      "filename": "market-notes.txt",
      "file_type": "txt",
      "character_count": 28,
      "status": "success",
      "error": null
    }],
    "combined_context": "Business Question:...",
    "metadata": {
      "number_of_documents": 1,
      "successful_documents": 1,
      "failed_documents": 0,
      "total_character_count": 28
    }
  }
}
```

FastAPI automatically returns `422` for missing or invalid required form fields.

## `POST /api/v1/analysis/run`

Runs the six deterministic specialist-agent placeholders against a prepared `BusinessContext`. It accepts JSON, not multipart form data.

### Request

```json
{
  "business_name": "Example SaaS",
  "context": {
    "business_question": "Should we expand into the Indian market?",
    "business_description": "We have annual revenue and a growth budget.",
    "documents": [],
    "combined_context": "Business Question: ...",
    "metadata": {
      "number_of_documents": 0,
      "successful_documents": 0,
      "failed_documents": 0,
      "total_character_count": 0
    }
  }
}
```

### Successful response (`200`)

Returns a generated `analysis_id`, optional `business_name`, `overall_status`, ISO-8601 `created_at`, per-agent results, and execution metadata. Each result includes `agent_name`, `status`, `summary`, `findings`, `recommendations`, `risks`, optional `confidence`, and metadata. `overall_status` is `completed_with_failures` if any agent fails while others complete.

Analysis uses the configured Gemini model to produce JSON-compatible specialist results. It does not call external search or a database. If Gemini is unavailable, rate limited, or returns invalid output, the affected agent has `status: "failed"` while remaining agents continue. The Legal & Compliance result explicitly states that it is informational analysis, not professional legal advice.

The response also contains stable frontend-facing report fields: `status` (`completed`, `partial`, or `failed`), `context_metadata`, `business_summary`, `executive_summary`, `key_opportunities`, `critical_risks`, `market_insights`, `financial_insights`, `compliance_considerations`, `strategic_recommendations`, `action_plan`, `recommended_kpis`, and `assumptions`. The existing `overall_status`, `agent_results`, `created_at`, and execution metadata are retained for compatibility. See [FRONTEND_API_CONTRACT.md](FRONTEND_API_CONTRACT.md) for the complete UI contract.
