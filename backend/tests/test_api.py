from __future__ import annotations

import shutil
import sys
from pathlib import Path

import pytest


@pytest.fixture()
def client(monkeypatch, tmp_path: Path):
    repo_backend = Path(__file__).resolve().parents[1]
    source_data = repo_backend / "data"
    temp_data = tmp_path / "data"
    shutil.copytree(source_data, temp_data)
    monkeypatch.setenv("OPPORTUNIQ_DATA_DIR", str(temp_data))
    monkeypatch.setenv("ILMU_API_KEY", "")
    if str(repo_backend) not in sys.path:
        sys.path.insert(0, str(repo_backend))

    from app.config import get_settings
    from app.services.container import get_container

    get_settings.cache_clear()
    get_container.cache_clear()

    from fastapi.testclient import TestClient
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client

    get_settings.cache_clear()
    get_container.cache_clear()


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["seedCounts"]["opportunities"] >= 10


def test_opportunities_endpoint_returns_ranked_items(client):
    response = client.get("/api/opportunities?sort=best-match")
    assert response.status_code == 200
    payload = response.json()
    assert payload["totalCount"] > 0
    assert payload["items"][0]["fitScore"] >= payload["items"][-1]["fitScore"] or payload["items"][0]["priorityScore"] >= payload["items"][-1]["priorityScore"]
    assert "recommendation" in payload["items"][0]


def test_save_opportunity_persists_to_profile(client):
    response = client.post("/api/opportunities/experian-se-2026/save", json={"saved": True})
    assert response.status_code == 200
    assert response.json()["saved"] is True

    profile = client.get("/api/profile").json()
    assert "experian-se-2026" in profile["profile"]["savedOpportunityIds"]


def test_toggle_planner_task_flips_completion(client):
    planner_before = client.get("/api/planner").json()
    task = planner_before["tasks"][0]

    toggled = client.post(f"/api/planner/tasks/{task['id']}/toggle")
    assert toggled.status_code == 200
    assert toggled.json()["completed"] is (not task["completed"])


def test_create_application_from_opportunity(client):
    response = client.post("/api/applications", json={"opportunityId": "experian-se-2026"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["opportunityId"] == "experian-se-2026"


def test_dashboard_featured_recommendation_has_ai_explanation_fields(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    payload = response.json()
    featured = payload["featuredRecommendation"]
    assert featured is not None
    assert featured["summary"]
    assert featured["whyTopMatchBullets"]
    assert featured["topPickRationale"]
    assert featured["explanationSource"] in {"glm", "fallback"}
    assert featured["aiExplanation"]["source"] in {"glm", "fallback"}


def test_advisor_chat_uses_question_and_returns_grounded_fallback(client):
    response = client.post(
        "/api/advisor/chat",
        json={
            "message": "What scholarships am I eligible for?",
            "history": [],
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["response"]
    assert payload["source"] == "fallback"
    assert payload["suggestedPrompts"]
    assert any(opportunity_id for opportunity_id in payload["citedOpportunityIds"])
