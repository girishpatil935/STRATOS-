# Executive_AI

Executive_AI is a hackathon backend for multi-agent executive decision support. It turns business text and optional PDF, DOCX, or TXT documents into normalized context, then uses six Gemini-backed specialist agents to produce a structured executive report.

## Architecture

```text
Frontend input/files → POST /api/v1/research/context → BusinessContext
BusinessContext → POST /api/v1/analysis/run → sequential agent orchestration
Research · Market · Finance · Risk · Legal → Strategy Planning → Executive report
```

Agents use a shared provider abstraction, not direct SDK calls. Gemini is the current provider. Individual failures and timeouts are retained in the response, while remaining agents continue. Legal & Compliance output is informational analysis, not legal advice.

## Project structure

```text
app/
  api/routes/       FastAPI endpoints
  agents/           six agents, base contract, orchestrator
  core/             settings and logging
  schemas/          API models
  services/ai/      provider abstraction and Gemini client
  services/         document, context, formatter, report services
docs/               architecture and frontend contracts
examples/           fictional EcoRide Mobility demo data
tests/              offline unit and API tests
```

## Prerequisites and setup

Requires Python 3.11 and a Gemini API key for live AI analysis.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` using placeholders only:

```env
GEMINI_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-3.6-flash
AI_REQUEST_TIMEOUT_SECONDS=45
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Other useful configuration: `HOST`, `PORT`, `MAX_UPLOAD_SIZE_BYTES`, `MAX_DOCUMENT_CONTEXT_CHARS`, and `MAX_LLM_CONTEXT_CHARS`. Never commit `.env`.

## Run and test

```powershell
uvicorn app.main:app --reload
pytest
```

Swagger: `http://127.0.0.1:8000/docs`

## API workflow

1. Send a multipart question, business description, and optional documents to `POST /api/v1/research/context`.
2. Keep the returned `data` object client-side.
3. Submit `{ "business_name": "...", "context": data }` to `POST /api/v1/analysis/run`.
4. Render the structured report and agent-level status fields. Use the fictional [EcoRide request](examples/ecoride_analysis_request.json) and [notes](examples/ecoride_mobility_notes.txt) for a demo.

See [FRONTEND_API_CONTRACT.md](docs/FRONTEND_API_CONTRACT.md) for complete request, response, CORS, loading, and partial-failure guidance.
