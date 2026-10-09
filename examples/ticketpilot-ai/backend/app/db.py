"""Small SQLite persistence layer. Replace with Postgres + migrations in Stage 5."""
from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

KNOWLEDGE = [
    ("KB-101", "Subscription and billing", "billing", "Plans renew monthly. Customers can update their payment method in Billing > Payment methods. For duplicate charges, ask for the invoice number and escalate to billing support."),
    ("KB-102", "Password reset", "account", "To reset a password, go to the sign-in page and choose Forgot password. The reset link expires after 30 minutes. Support staff must never request a user's password."),
    ("KB-103", "Refund policy", "refund", "Refund requests are reviewed within 5 business days. Eligibility depends on the purchase terms; never promise approval without a human review."),
    ("KB-104", "Service outage", "technical", "If a customer reports an outage, collect the time, affected feature, and any error code. Check the official status page before confirming an active incident."),
    ("KB-105", "Changing your plan", "subscription", "Customers can review plan options under Settings > Subscription. A plan change may affect the next invoice; confirm the pricing before applying changes."),
]

SEED_TICKETS = [
    ("Aarav Mehta", "aarav@example.com", "Charged twice for my subscription", "Hi, I was charged twice for my Pro plan this month. Could someone check invoice INV-2048 and help me understand the duplicate payment?", "billing", "high", "open", "email", 3),
    ("Sophia Reed", "sophia@example.com", "Unable to sign into my account", "I requested a password reset but the link seems to have expired. How do I access my account again?", "account", "medium", "open", "chat", 2),
    ("Daniel Brooks", "daniel@example.com", "Dashboard shows an error", "Our dashboard says error 502 when we open reports. This started this morning and affects three team members.", "technical", "urgent", "open", "web", 1),
    ("Priya Shah", "priya@example.com", "How do I upgrade my plan?", "We're growing our team. Can you explain where we can see available subscription plans?", "subscription", "low", "resolved", "email", 6),
    ("Emily Clark", "emily@example.com", "Question about refund eligibility", "I made a purchase yesterday and would like to request a refund. What is the review process?", "refund", "medium", "pending", "web", 5),
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect(path: str):
    conn = sqlite3.connect(path, timeout=5)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def database(path: str):
    conn = connect(path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def initialize(path: str, seed: bool = True):
    if path != ":memory:":
        Path(path).parent.mkdir(parents=True, exist_ok=True)
    with database(path) as conn:
        conn.execute("""CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            customer TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'general',
            priority TEXT NOT NULL DEFAULT 'medium',
            status TEXT NOT NULL DEFAULT 'open',
            channel TEXT NOT NULL DEFAULT 'web',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            ai_reply TEXT,
            ai_provider TEXT
        )""")
        conn.execute("""CREATE TABLE IF NOT EXISTS knowledge (
            id TEXT PRIMARY KEY, title TEXT NOT NULL,
            category TEXT NOT NULL, content TEXT NOT NULL
        )""")
        conn.executemany("INSERT OR IGNORE INTO knowledge(id,title,category,content) VALUES(?,?,?,?)", KNOWLEDGE)
        if seed and conn.execute("SELECT count(*) FROM tickets").fetchone()[0] == 0:
            for name, email, subject, msg, category, priority, status, channel, hours_ago in SEED_TICKETS:
                from datetime import timedelta
                stamp = (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()
                conn.execute("""INSERT INTO tickets(id,customer,email,subject,message,category,priority,status,channel,created_at,updated_at)
                    VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (
                    "TKT-" + uuid4().hex[:8].upper(), name, email, subject, msg, category,
                    priority, status, channel, stamp, stamp
                ))


def as_dict(row):
    return dict(row) if row is not None else None
