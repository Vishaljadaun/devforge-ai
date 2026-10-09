# Lesson 01 — Your first complete AI-enabled application

## Goal

Understand one complete path through the system: **click UI → call REST API → query SQLite → retrieve relevant policy → optionally call an LLM → display an editable draft**.

You learn while running and changing source code, not by memorizing libraries.

## Trace the code

1. `frontend/src/App.tsx`: find the `generate()` function. It fires when you click **Generate reply draft**.
2. `frontend/src/api.ts`: find `api.draft(...)`. It sends `POST /api/tickets/{id}/draft`.
3. `backend/app/main.py`: find the `draft()` route. It loads the ticket and available knowledge articles and calls `generate_draft()`.
4. `backend/app/ai.py`: inspect `classify()`, `find_knowledge()`, and `generate_draft()`.
5. `backend/app/db.py`: review tables and sample data.
6. Go to `http://127.0.0.1:8000/docs` and call the API directly.

## Why the demo mode matters

Without `GROQ_API_KEY`, the application uses deterministic template logic; it is **not** a trained model or generative AI. This makes your environment easy to debug without external cost. With a key, FastAPI sends a request from the server to Groq and parses a JSON response containing the draft. The frontend never has your secret key.

## Your hands-on challenges

### Challenge A — Easy (15 min)

Add a "VIP" label next to tickets whose subject includes the word "enterprise". Only use frontend display logic; do not modify the database.

### Challenge B — Medium (30 min)

In `backend/app/ai.py`, add a new `delivery` classification using terms "parcel", "shipping", "delivery", and "tracking". Add a relevant policy article to `KNOWLEDGE` in `db.py`. To see new articles, delete **only your local development** SQLite database and restart (this resets demo data), or insert the article manually. Write a test to confirm classification.

### Challenge C — Medium (45 min)

Make the drafted reply editable *and persistent*. Right now changes to the textarea are only in browser state; only the original generated draft is saved. Add a backend `PATCH /api/tickets/{id}/draft` endpoint that validates and saves edited reply text, then a **Save draft** button. Keep this distinct from sending email.

### Challenge D — Advanced (60 min)

Return the policy article ID/title alongside saved drafts and show the source after refreshing. This requires changes to the database schema, API responses, and frontend.

## Stage 2 — RAG preview

Our current `find_knowledge()` uses keyword intersection with a category boost. It does **not** create embeddings, search a vector database, or cite arbitrary PDFs. In the next stage, replace this function with document ingestion, text chunking, embeddings, pgvector search, retrieval evaluation, and source-aware answers. Measure evidence quality before shipping.

## Safety and production notes

- Customer inputs are untrusted. Backend prompts instruct the model not to obey instructions embedded in ticket text, though further protections are required before production.
- Never allow an AI response to automatically issue refunds, modify customer records, or send email without authorization and review.
- Do not put actual customer personal data in a demo project or share that data with third-party AI providers without appropriate approvals.
- This is a learning repo, not a production-ready customer-support service.
