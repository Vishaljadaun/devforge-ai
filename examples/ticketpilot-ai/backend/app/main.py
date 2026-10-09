"""REST API for TicketPilot AI Stage 1."""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from pathlib import Path
from uuid import uuid4

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from dotenv import load_dotenv

from .ai import generate_draft
from .db import as_dict, database, initialize, now_iso

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")


class TicketCreate(BaseModel):
    customer: str = Field(min_length=2, max_length=80)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=150)
    message: str = Field(min_length=10, max_length=4000)
    channel: str = Field(default="web", pattern="^(email|chat|web)$")


class TicketUpdate(BaseModel):
    status: str = Field(pattern="^(open|pending|resolved)$")


def create_app(db_path: str | None = None, seed: bool = True) -> FastAPI:
    path = db_path or os.environ.get("DATABASE_PATH", str(ROOT / "ticketpilot.db"))

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        initialize(path, seed=seed)
        yield

    app = FastAPI(title="TicketPilot AI API", version="0.1.0", lifespan=lifespan)
    origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST", "PATCH"], allow_headers=["Content-Type"])

    @app.get("/api/health")
    def health():
        return {"status": "ok", "ai_mode": "groq" if os.getenv("GROQ_API_KEY", "").strip() else "demo", "version": "0.1.0"}

    @app.get("/api/tickets")
    def tickets(q: str = Query(default="", max_length=150), status: str = Query(default="all", pattern="^(all|open|pending|resolved)$")):
        sql = "SELECT * FROM tickets WHERE 1=1"
        args = []
        if q.strip():
            sql += " AND (subject LIKE ? OR customer LIKE ? OR message LIKE ?)"
            term = f"%{q.strip()}%"
            args.extend([term, term, term])
        if status != "all":
            sql += " AND status=?"
            args.append(status)
        sql += " ORDER BY created_at DESC"
        with database(path) as conn:
            return [as_dict(r) for r in conn.execute(sql, args).fetchall()]

    @app.get("/api/tickets/{ticket_id}")
    def get_ticket(ticket_id: str):
        with database(path) as conn:
            ticket = as_dict(conn.execute("SELECT * FROM tickets WHERE id=?", (ticket_id,)).fetchone())
        if ticket is None:
            raise HTTPException(404, "Ticket not found")
        return ticket

    @app.post("/api/tickets", status_code=201)
    def add_ticket(payload: TicketCreate):
        ticket_id = "TKT-" + uuid4().hex[:8].upper()
        stamp = now_iso()
        with database(path) as conn:
            conn.execute("""INSERT INTO tickets(id,customer,email,subject,message,category,priority,status,channel,created_at,updated_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (ticket_id, payload.customer, str(payload.email), payload.subject,
                payload.message, "general", "medium", "open", payload.channel, stamp, stamp))
            return as_dict(conn.execute("SELECT * FROM tickets WHERE id=?", (ticket_id,)).fetchone())

    @app.patch("/api/tickets/{ticket_id}")
    def update_ticket(ticket_id: str, payload: TicketUpdate):
        with database(path) as conn:
            cursor = conn.execute("UPDATE tickets SET status=?,updated_at=? WHERE id=?", (payload.status, now_iso(), ticket_id))
            if not cursor.rowcount:
                raise HTTPException(404, "Ticket not found")
            return as_dict(conn.execute("SELECT * FROM tickets WHERE id=?", (ticket_id,)).fetchone())

    @app.get("/api/knowledge")
    def knowledge():
        with database(path) as conn:
            return [as_dict(r) for r in conn.execute("SELECT * FROM knowledge ORDER BY id").fetchall()]

    @app.get("/api/metrics")
    def metrics():
        with database(path) as conn:
            counts = {r["status"]: r["count"] for r in conn.execute("SELECT status,count(*) AS count FROM tickets GROUP BY status")}
            urgent = conn.execute("SELECT count(*) FROM tickets WHERE priority='urgent' AND status!='resolved'").fetchone()[0]
            drafts = conn.execute("SELECT count(*) FROM tickets WHERE ai_reply IS NOT NULL").fetchone()[0]
        return {"total": sum(counts.values()), "open": counts.get("open", 0),
                "pending": counts.get("pending", 0), "resolved": counts.get("resolved", 0),
                "urgent": urgent, "drafts": drafts}

    @app.post("/api/tickets/{ticket_id}/draft")
    async def draft(ticket_id: str):
        with database(path) as conn:
            ticket = as_dict(conn.execute("SELECT * FROM tickets WHERE id=?", (ticket_id,)).fetchone())
            articles = [as_dict(r) for r in conn.execute("SELECT * FROM knowledge").fetchall()]
        if ticket is None:
            raise HTTPException(404, "Ticket not found")
        try:
            result = await generate_draft(ticket, articles)
        except httpx.HTTPStatusError as exc:
            raise HTTPException(502, f"AI provider returned HTTP {exc.response.status_code}. Check your key, model, and quota.") from exc
        except (httpx.RequestError, ValueError, KeyError) as exc:
            raise HTTPException(502, f"AI draft failed: {type(exc).__name__}. Check backend logs.") from exc
        with database(path) as conn:
            conn.execute("""UPDATE tickets SET ai_reply=?,ai_provider=?,category=?,priority=?,updated_at=? WHERE id=?""",
                (result["reply"], result["provider"], result["category"], result["priority"], now_iso(), ticket_id))
        return result

    return app


app = create_app()
