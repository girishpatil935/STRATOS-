# STRATOS

## Multi-Agent Executive Decision Intelligence Platform

STRATOS is an AI-powered multi-agent decision-support platform designed to help businesses analyze complex strategic decisions from multiple perspectives.

Instead of sending a business problem to a single LLM and receiving a generic response, STRATOS decomposes the problem into specialized analytical tasks and coordinates multiple AI agents through a controlled orchestration workflow.

The system analyzes:

- Business and industry context
- Market opportunity
- Financial feasibility
- Business risks
- Legal and compliance considerations
- Strategic direction

The final output is a structured executive intelligence report designed to support human decision-making.

---

## 🚀 Core Idea

A complex business decision usually requires expertise across multiple domains.

For example:

> "Should an EV startup expand from Bengaluru to Pune and Jaipur with a ₹3 crore budget?"

A single AI response may provide a general answer.

STRATOS instead decomposes the problem:

```
                    Business Question
                           │
                           ▼
                    STRATOS Orchestrator
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    Research            Market             Finance
      Agent              Agent               Agent
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                         Risk
                         Agent
                           │
                           ▼
                         Legal
                         Agent
                           │
                           ▼
                       Strategy
                         Agent
                           │
                           ▼
                 Executive Recommendation
```

This allows each analytical responsibility to be handled independently while the orchestrator maintains the overall workflow.

---

## 🧠 Multi-Agent System

STRATOS currently contains six specialized AI agents.

### 1. Research Agent

Responsible for establishing the factual and contextual foundation of the business problem.

Typical responsibilities:
- Industry research
- Business context analysis
- Relevant trends
- Market information
- Supporting evidence

### 2. Market Analysis Agent

Analyzes the market opportunity surrounding the proposed business decision.

Typical responsibilities:
- Market demand
- Target market
- Competition
- Market trends
- Customer segments
- Market opportunity

### 3. Finance Agent

Evaluates the financial feasibility of the proposed decision.

Typical responsibilities:
- Budget analysis
- Cost considerations
- Revenue potential
- Financial feasibility
- ROI considerations
- Unit economics

### 4. Risk Assessment Agent

Identifies potential risks associated with the decision.

Typical responsibilities:
- Market risk
- Financial risk
- Operational risk
- Execution risk
- Business risk
- Technology risk

### 5. Legal & Compliance Agent

Evaluates legal and regulatory considerations.

Typical responsibilities:
- Regulatory requirements
- Compliance requirements
- Privacy considerations
- Licensing
- Legal risks
- Industry regulations

### 6. Strategy Planning Agent

The final synthesis layer.

It receives the relevant outputs from the previous agents and produces an actionable strategic recommendation.

Typical responsibilities:
- Compare findings
- Identify strategic opportunities
- Evaluate trade-offs
- Recommend an approach
- Suggest implementation priorities
- Produce the executive recommendation

---

## 🏗️ System Architecture

STRATOS follows a layered architecture.

```
                         ┌──────────────────────┐
                         │        USER          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React Frontend     │
                         │   TypeScript + Vite  │
                         └──────────┬───────────┘
                                    │
                               REST API
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │       FastAPI        │
                         │      Backend         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Workflow Service   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Orchestrator      │
                         └──────────┬───────────┘
                                    │
                    Sequential Agent Execution
                                    │
          ┌─────────────────────────┼────────────────────────┐
          │                         │                        │
          ▼                         ▼                        ▼
      Research                  Market                   Finance
       Agent                    Agent                     Agent
          │                         │                        │
          └─────────────────────────┼────────────────────────┘
                                    │
                                    ▼
                                  Risk
                                  Agent
                                    │
                                    ▼
                                  Legal
                                  Agent
                                    │
                                    ▼
                                Strategy
                                  Agent
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ Executive Intelligence│
                         │       Report         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                              React Frontend
```

---

## 🔄 Complete Workflow

The complete STRATOS workflow is:

```
 1. User enters business information
 2. User provides strategic question
 3. User adds supporting context/documents
 4. Frontend sends request to FastAPI
 5. Backend creates a new workflow
 6. Workflow initializes six agent states
 7. Orchestrator starts execution
 8. Research Agent executes
 9. Result is validated and stored
10. Market Agent executes
11. Result is validated and stored
12. Finance Agent executes
13. Result is validated and stored
14. Risk Agent executes
15. Result is validated and stored
16. Legal Agent executes
17. Result is validated and stored
18. Strategy Agent synthesizes findings
19. Final executive report generated
20. Frontend retrieves and displays results
```

---

## ⚙️ Orchestration

The orchestrator is the control layer of STRATOS.

It is responsible for:
- Creating and managing workflow execution
- Controlling agent order
- Passing context between agents
- Tracking agent states
- Handling agent failures
- Persisting results
- Moving execution to the next agent
- Determining when the workflow is complete

The current prototype uses sequential execution:

```
Research → Market → Finance → Risk → Legal → Strategy
```

Only one agent is executed at a time.

This makes the workflow easier to control and allows downstream agents to use relevant outputs from previous stages.

---

## 🔁 Agent State Management

Every agent follows a controlled lifecycle:

```
WAITING → RUNNING → COMPLETED
                │
                └──► FAILED
```

Possible workflow states include:

| State | Meaning |
|---|---|
| `WAITING` | Agent has not started yet |
| `RUNNING` | Agent is currently executing |
| `COMPLETED` | Agent finished and produced a validated result |
| `FAILED` | Agent execution or validation failed |
| `SKIPPED` | Agent was not required for this workflow |
| `QUOTA_EXHAUSTED` | AI provider quota/rate limit was hit |

An agent is only marked `COMPLETED` after:
1. The agent actually executes.
2. The AI provider returns a response.
3. The response is parsed.
4. The response passes validation.
5. The result is successfully stored.

The system does not fabricate results when an AI request fails.

---

## 🤖 AI Architecture

The current prototype uses **Gemini** as the underlying LLM.

However, STRATOS is designed around a **model-agnostic architecture** — the agent and the model are separate concepts.

```
Agent
│
├── Role
├── Instructions
├── Context
├── Output Schema
├── Tools / Data
└── LLM Provider
```

This allows different agents to use different models in future versions:

| Agent | Future Model Focus |
|---|---|
| Research Agent | Research-focused model |
| Market Agent | Reasoning / analysis model |
| Finance Agent | Numerical reasoning model |
| Risk Agent | Advanced reasoning model |
| Legal Agent | Domain-specific legal model |
| Strategy Agent | Advanced reasoning model |
| Report Generation | Efficient summarization model |

The orchestrator remains independent from the specific model provider.

---

## 🌐 API Architecture

The frontend communicates with the backend through REST APIs.

High-level API flow:

```
Frontend
   │
   ├── Create Context
   ├── Create Analysis
   ├── Get Workflow
   └── Get Results
   │
   ▼
FastAPI → Workflow Service → Orchestrator → AI Agents
```

### API Structure

#### Health Check
```
GET /health
```
Used to verify that the backend is running.

#### Create Business Context
```
POST /api/v1/research/context
```
Used to submit and prepare the business context for analysis.

Typical information includes:
- Business Information
- Industry
- Product / Service
- Target Customer
- Budget
- Team Information
- Competitors
- Business Goals
- Location / Target Market
- Strategic Question
- Additional Context
- Documents

#### Create New Analysis
```
POST /api/v1/analysis/new
```
Creates a new analysis workflow.

The backend:
```
Create Workflow → Initialize Agents → Start Orchestration → Execute Agents
```

#### Get Analysis
```
GET /api/v1/analysis/{workflow_id}
```
Retrieves the existing workflow and its results.

> **Important:** GET requests do not start AI execution. They only retrieve the existing state.

---

## 🔐 Workflow Protection

STRATOS separates:

- **CREATE NEW ANALYSIS**, from
- **FETCH EXISTING ANALYSIS**

Refreshing the frontend or polling the workflow does not trigger another AI execution.

A currently running workflow cannot accidentally be started multiple times.

Completed or failed historical workflows remain available without blocking the creation of a new analysis.

---

## 🧵 Background Processing

Multi-agent AI workflows can take significant time because multiple LLM calls are required.

STRATOS therefore supports background processing through **Celery** and **Redis**.

Architecture:

```
FastAPI → (create background task) → Redis → (task message) → Celery Worker → Orchestrator → AI Agents
```

### Celery

Celery is responsible for executing long-running background tasks.

Instead of keeping the HTTP request open while six agents execute, the workflow can run asynchronously.

### Redis

Redis can act as the message broker between the FastAPI application and Celery workers.

It provides fast communication for background task processing.

---

## 🗄️ Database

PostgreSQL is used for persistent storage.

The database stores information such as:

```
Workflow
   │
   ├── Business Context
   ├── Workflow Status
   ├── Agent Status
   ├── Agent Results
   └── Final Strategy
```

This allows the frontend to retrieve the existing workflow without executing the AI agents again.

---

## 📁 Project Structure

A simplified project structure:

```
STRATOS/
│
├── backend/
│   │
│   ├── app/
│   │   │
│   │   ├── api/
│   │   │   └── routes/
│   │   │
│   │   ├── agents/
│   │   │   ├── research/
│   │   │   ├── market/
│   │   │   ├── finance/
│   │   │   ├── risk/
│   │   │   ├── legal/
│   │   │   └── strategy/
│   │   │
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   └── workflow/
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── core/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── .env
│
├── docs/
│   ├── FRONTEND_API_CONTRACT.md
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```

> ⚠️ **Note:** Before committing, double-check the actual folder names and API paths against your current repository — this structure reflects the intended architecture and may have drifted from the file-for-file layout.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | User interface |
| Frontend | TypeScript | Type-safe frontend development |
| Frontend | Vite | Frontend development/build tooling |
| Styling | Tailwind CSS | UI styling |
| Backend | Python | Backend development |
| Backend | FastAPI | REST API layer |
| AI | Gemini | Current prototype LLM |
| Orchestration | Multi-Agent Orchestrator | Agent coordination |
| Background Tasks | Celery | Asynchronous execution |
| Message Broker | Redis | Task/message transport |
| Database | PostgreSQL | Persistent storage |
| API Communication | REST | Frontend/backend communication |

---

## 🧪 Example Analysis

| Field | Value |
|---|---|
| Business | Urban Mobility Electric Scooters |
| Industry | Electric Mobility / EV Subscription |
| Product | Monthly electric scooter subscription |
| Target Customers | University students and gig workers |
| Budget | ₹3 Crore |
| Target Markets | Pune and Jaipur |

**Strategic Question:**
> Should Urban Mobility expand its EV scooter subscription service to Pune and Jaipur?

STRATOS processes the question through:

```
Research → Market → Finance → Risk → Legal → Strategy
```

The final result is an executive-level strategic recommendation.

---

## 🛡️ Reliability & Hallucination Handling

LLM responses are not assumed to be automatically correct.

The current system performs structural response validation before storing agent results.

The validation process includes:

```
LLM Response → Parse Response → Validate Structure → Validate Required Fields → Store Result
```

If the response cannot be parsed or does not meet the expected structure, the agent is not marked as successfully completed.

Future reliability improvements include:
- Retrieval-Augmented Generation
- Source grounding
- Evidence verification
- Cross-agent consistency checks
- Confidence scoring
- Human-in-the-loop review

> STRATOS is a decision-support system and does not replace human decision-makers.

---

## 🚨 Failure Handling

AI APIs can fail because of:
- Network failures
- API errors
- Invalid responses
- Timeouts
- Rate limits
- Quota exhaustion

For example, Gemini may return:

```
429 RESOURCE_EXHAUSTED
```

STRATOS handles this by recording the failure and preventing unnecessary additional AI requests.

The system does not generate fake agent results to make the workflow appear successful.

---

## 🔮 Future Roadmap

**1. Multi-Model Intelligence**
Route individual agents to specialized AI models based on task requirements.

**2. Advanced RAG**
Integrate web search, document retrieval, vector databases, and evidence-backed reasoning.

**3. Parallel Agent Execution**
Independent analytical tasks can be executed concurrently to reduce latency. The final synthesis stage can still remain controlled and sequential.

**4. Domain-Specific Models**
Introduce specialized models for financial analysis, legal analysis, research, market intelligence, numerical reasoning, and report generation.

**5. Enterprise Integrations**
Potential integrations: CRM, ERP, Google Workspace, Slack, Jira, and business intelligence systems.

**6. Continuous Executive Intelligence**
Future versions can continuously monitor market conditions, competitors, business KPIs, financial indicators, and regulatory changes — alerting decision-makers when strategic conditions change.

---

## 🎯 Vision

STRATOS aims to become an AI-powered executive intelligence layer for organizations.

The long-term vision is:

```
                 Business Data
                       │
                       ▼
                STRATOS Platform
                       │
              ┌────────┴────────┐
              │                 │
         AI Research       Business Data
              │                 │
              └────────┬────────┘
                       ▼
                 Multi-Agent
                 Intelligence
                       │
                       ▼
              Strategic Analysis
                       │
                       ▼
              Executive Insights
                       │
                       ▼
                 Human Decision
```

The goal is not to replace executives.

The goal is to give them a team of AI-powered analytical specialists that can research, analyze, challenge assumptions, identify risks, and help transform complex information into actionable decisions.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd STRATOS
```

### 2. Backend Setup

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it (Windows):

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file.

Example:

```env
GEMINI_API_KEY=your_api_key_here
```

Never commit real API keys.

### 4. Start Backend

Use the project's configured FastAPI startup command, for example:

```bash
uvicorn app.main:app --reload
```

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security

Never commit:
- `.env`
- API keys
- Passwords
- Database credentials
- Private tokens

Use `.env.example` to document required environment variables.

---

## 📌 Current Status

**Functional Hackathon Prototype**

Current capabilities:
- Business context collection
- Strategic question processing
- Multi-agent orchestration
- Six specialized AI agents
- Sequential agent execution
- Gemini-based AI reasoning
- Agent state tracking
- Structured result validation
- Workflow persistence
- Executive strategy synthesis
- Frontend visualization
- Background workflow architecture

---

## 👥 Project

**STRATOS** : Multi-Agent Executive Decision Intelligence Platform

Built as a hackathon prototype exploring the use of multi-agent (Using 6 Agents) AI orchestration for business strategy and executive decision support.
**Owner** : **Girish Patil**
