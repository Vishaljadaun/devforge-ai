# TicketPilot AI — Stage 1

A practical **learn-by-building** AI Engineering project: a customer support workspace with ticket management, rule-based ticket classification, knowledge lookup, and optional Groq-powered reply drafts.

> **Scope:** This is an educational development starter, **not yet a production SaaS**. It does not contain authentication, tenant separation, background jobs, email sending, payments, vector RAG, or agent tools. All records are demo data unless you add them yourself.

## What works now

- Polished, responsive React + TypeScript dashboard with overview, ticket inbox, knowledge base, analytics, and settings.
- Create tickets, search/filter tickets, change status, inspect ticket details.
- Persist tickets and knowledge in SQLite through FastAPI.
- Click **Generate reply draft** to classify the selected ticket, find a relevant local knowledge article, and compose a suggested reply.
- **With `GROQ_API_KEY`:** calls the Groq chat completions API (using `llama-3.3-70b-versatile` by default).
- **Without `GROQ_API_KEY`:** returns a **rule-based, non-AI demonstration** so the UI still works.
- Editable draft with Copy button. **No customer email is ever sent.**
- Validations, basic API errors, explicit local CORS allow-list, backend tests.

## Requirements

- Python 3.10+ (3.11+ recommended)
- Node.js 20.19+ or 22.12+ (per Vite documentation)
- npm

## 1. Run the backend

In terminal **A**:

```bash
cd ticketpilot-ai/backend
python -m venv .venv
```

Activate the virtual environment:

- Windows PowerShell: `.venv\Scripts\Activate.ps1`
- Windows CMD: `.venv\Scripts\activate.bat`
- Linux/macOS: `source .venv/bin/activate`

Then:

```bash
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env`:

- Windows: `copy .env.example .env`
- Linux/macOS: `cp .env.example .env`

Optional: obtain a key from https://console.groq.com/keys and set `GROQ_API_KEY=...` in `backend/.env`. **Never put a secret in the frontend.**

Start the server **from the backend directory**:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Check:
- http://127.0.0.1:8000/api/health
- http://127.0.0.1:8000/docs (interactive Swagger API docs)

SQLite file `backend/ticketpilot.db` is created automatically with five sample tickets and five knowledge articles on first run.

## 2. Run the frontend

In terminal **B**:

```bash
cd ticketpilot-ai/frontend
npm install
npm run dev
```

Open http://localhost:5173.

You do **not** need a frontend `.env` for local development: Vite proxies `/api` to FastAPI on port 8000.

## 3. First exercise (10–20 minutes)

1. Open **Ticket inbox** and click on the ticket "Charged twice for my subscription".
2. Click **Generate reply draft**. Observe the suggested category, priority, policy snippet and generated draft.
3. Edit the response, click **Copy**, then mark the ticket **Pending** or **Resolved**.
4. Create your own ticket from the **New ticket** button. Try an error/bug description.
5. Visit **Analytics** and check that counts update.
6. Restart the backend and confirm tickets persist.

Read [`docs/LESSON_01.md`](docs/LESSON_01.md) for how the code works and extension challenges.

## Tests

From the backend directory:

```bash
python -m pytest -q
```

Frontend type-check and bundle:

```bash
cd frontend
npm run build
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API status and draft mode |
| GET | `/api/metrics` | Derived ticket counts |
| GET | `/api/tickets` | List/search/filter tickets |
| GET | `/api/tickets/{id}` | One ticket |
| POST | `/api/tickets` | Create ticket |
| PATCH | `/api/tickets/{id}` | Update ticket status |
| POST | `/api/tickets/{id}/draft` | Generate and save draft (manual action) |
| GET | `/api/knowledge` | Seeded policy knowledge |

## Architecture

```text
React + TypeScript + Vite (localhost:5173)
                  |
                /api
                  |
Python FastAPI (localhost:8000)
      |                    |
      v                    v
  SQLite tickets       AI drafting module
  + policies           |           |
                       |           +-- Groq LLM (only when key provided)
                       +-- Rule-based demo (no key)
```

**Knowledge lookup is currently keyword based, not RAG.** Real embeddings, chunking, vector search and evaluation come in Stage 2.

## Environment variables

Backend (`backend/.env`):
- `GROQ_API_KEY` (optional): enables real LLM-generated drafts.
- `GROQ_MODEL` (optional): default `llama-3.3-70b-versatile`.
- `CORS_ORIGINS` (optional): allowed frontend origin(s), comma-separated.
- `DATABASE_PATH` (optional): location of SQLite database.

Frontend (`frontend/.env` — only if deploying separately):
- `VITE_API_URL`: deployed FastAPI root URL, e.g. `https://your-backend.onrender.com`.

Groq API calls may incur costs and are subject to model availability, usage quotas, and provider terms. Always review LLM outputs for accuracy before using them.

## Deployment later

- React frontend: Vercel, root directory `frontend`, build `npm run build`, output `dist`, `VITE_API_URL` set to deployed backend URL.
- Backend: Render web service, root directory `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `CORS_ORIGINS` to **your exact Vercel URL**.
- **SQLite on ephemeral hosting is not suitable for durable production storage.** Migrate to managed PostgreSQL with migrations before public deployment or multi-user use.
- Add authentication, per-user permissions, CSRF considerations, request limits, secret management, privacy review, tracing, and evaluation before inviting real customers.

## Learning path

1. **Stage 1 (this repo):** React, Python, APIs, local persistence, safe LLM use.
2. **Stage 2:** Document upload + embeddings + vector retrieval + source citations, evaluated on a test set.
3. **Stage 3:** Agent tool calling with human approval and audit logs.
4. **Stage 4:** Introduce .NET Core business API and integrate with the Python AI microservice.
5. **Stage 5:** SaaS auth, organization workspaces, PostgreSQL, CI/CD, monitoring, secure deployment.
