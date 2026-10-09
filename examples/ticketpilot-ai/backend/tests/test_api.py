from fastapi.testclient import TestClient
from app.main import create_app


def test_health_and_seeded_metrics(tmp_path, monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    app = create_app(str(tmp_path / "test.db"))
    with TestClient(app) as client:
        assert client.get("/api/health").json()["ai_mode"] == "demo"
        metrics = client.get("/api/metrics").json()
        assert metrics["total"] == 5
        assert metrics["urgent"] == 1
        assert len(client.get("/api/tickets").json()) == 5


def test_ticket_creation_drafting_and_status(tmp_path, monkeypatch):
    monkeypatch.delenv("GROQ_API_KEY", raising=False)
    app = create_app(str(tmp_path / "test.db"), seed=False)
    with TestClient(app) as client:
        created = client.post("/api/tickets", json={
            "customer": "Test User", "email": "user@example.com",
            "subject": "Charged twice on my plan", "message": "Please help, I was charged twice this month.",
            "channel": "email"
        })
        assert created.status_code == 201
        ticket_id = created.json()["id"]
        drafted = client.post(f"/api/tickets/{ticket_id}/draft")
        assert drafted.status_code == 200
        data = drafted.json()
        assert data["provider"] == "demo"
        assert data["category"] == "billing"
        assert data["source"]["id"] == "KB-101"
        assert "human review" not in data["reply"].lower() or data["provider"] == "demo"
        updated = client.patch(f"/api/tickets/{ticket_id}", json={"status": "resolved"})
        assert updated.status_code == 200
        assert updated.json()["status"] == "resolved"
        assert client.get("/api/metrics").json()["resolved"] == 1


def test_invalid_input_and_not_found(tmp_path):
    with TestClient(create_app(str(tmp_path / "test.db"), seed=False)) as client:
        assert client.post("/api/tickets", json={"customer":"x", "email":"bad", "subject":"x", "message":"small"}).status_code == 422
        assert client.get("/api/tickets/NOT-FOUND").status_code == 404
        assert client.post("/api/tickets/NOT-FOUND/draft").status_code == 404
        assert client.patch("/api/tickets/NOT-FOUND", json={"status":"open"}).status_code == 404
        assert client.patch("/api/tickets/x", json={"status":"deleted"}).status_code == 422


def test_filter_search_and_knowledge(tmp_path, monkeypatch):
    monkeypatch.delenv('GROQ_API_KEY', raising=False)
    with TestClient(create_app(str(tmp_path / 'test.db'))) as client:
        open_tickets = client.get('/api/tickets', params={'status': 'open'}).json()
        assert len(open_tickets) == 3
        matches = client.get('/api/tickets', params={'q': 'charged twice'}).json()
        assert len(matches) == 1
        assert 'Charged twice' in matches[0]['subject']
        articles = client.get('/api/knowledge').json()
        assert len(articles) == 5
        assert all(article['id'].startswith('KB-') for article in articles)


def test_draft_provider_error_reports_safe_message(tmp_path, monkeypatch):
    import httpx
    monkeypatch.setenv('GROQ_API_KEY', 'not-a-real-key')

    class FakeClient:
        async def __aenter__(self):
            return self
        async def __aexit__(self, *_):
            pass
        async def post(self, url, **kwargs):
            assert url == 'https://api.groq.com/openai/v1/chat/completions'
            assert kwargs['json']['response_format'] == {'type': 'json_object'}
            return httpx.Response(429, request=httpx.Request('POST', url))

    monkeypatch.setattr(httpx, 'AsyncClient', lambda **_: FakeClient())
    with TestClient(create_app(str(tmp_path / 'test.db'))) as client:
        ticket = client.get('/api/tickets').json()[0]
        result = client.post(f"/api/tickets/{ticket['id']}/draft")
        assert result.status_code == 502
        assert 'HTTP 429' in result.json()['detail']
        assert 'not-a-real-key' not in result.text
