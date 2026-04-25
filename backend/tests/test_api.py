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


def test_legacy_opportunity_aliases_resolve_for_frontend_ids(client):
    response = client.get("/api/opportunities/petronas-2025")
    assert response.status_code == 200
    payload = response.json()
    assert payload["id"] == "petronas-2026"
    assert payload["requestedId"] == "petronas-2025"

    google = client.get("/api/opportunities/google-2025")
    assert google.status_code == 200
    assert google.json()["id"] == "google-step-2026"


def test_opportunities_support_plural_categories_and_human_sort_labels(client):
    response = client.get("/api/opportunities?category=Internships&sort=Best Match")
    assert response.status_code == 200
    payload = response.json()
    assert payload["items"]
    assert all(item["category"] == "Internship" for item in payload["items"])
    assert "Internships" in payload["availableCategories"]


def test_readiness_modules_include_navigation_hrefs(client):
    response = client.get("/api/readiness")
    assert response.status_code == 200
    payload = response.json()
    assert payload["modules"]
    assert payload["modules"][0]["href"].startswith("/")


def test_planner_tasks_include_done_alias_and_support_create_task(client):
    planner = client.get("/api/planner")
    assert planner.status_code == 200
    first_task = planner.json()["tasks"][0]
    assert "done" in first_task
    assert first_task["done"] == first_task["completed"]

    created = client.post(
        "/api/planner/tasks",
        json={
            "title": "Prep custom task",
            "subtitle": "Frontend compatibility task",
            "type": "apply-now",
            "duration": "30min",
        },
    )
    assert created.status_code == 200
    assert created.json()["done"] is False


def test_pipeline_stage_can_be_manually_overridden(client):
    response = client.patch(
        "/api/pipeline/google-step-2025",
        json={"stage": "track-later"},
    )
    assert response.status_code == 200
    assert response.json()["pipelineStage"] == "track-later"

    pipeline = client.get("/api/pipeline")
    assert pipeline.status_code == 200
    moved = next(item for item in pipeline.json()["stages"]["track-later"] if item["id"] == "google-step-2026")
    assert moved["pipelineStage"] == "track-later"


def test_network_supports_connect_and_message_actions(client):
    network = client.get("/api/network")
    assert network.status_code == 200
    assert "connected" in network.json()["suggestedConnections"][0]
    assert "messaging" in network.json()["connections"][0]

    connected = client.post("/api/network/suggested/suggested-001/connect")
    assert connected.status_code == 200
    assert connected.json()["connected"] is True

    messaged = client.post(
        "/api/network/connections/conn-001/message",
        json={"message": "Hello mentor"},
    )
    assert messaged.status_code == 200
    assert messaged.json()["message"] == "Hello mentor"


def test_settings_endpoint_matches_latest_frontend_sections(client):
    response = client.get("/api/settings")
    assert response.status_code == 200
    payload = response.json()
    assert payload["account"]["fullName"]
    assert payload["notifications"] == payload["preferences"]
    assert payload["aiPreferences"]["contextAwareness"]
    assert payload["region"]["timezone"]
    assert payload["privacy"]["profileVisibility"]
    assert payload["security"]["passwordLastChangedLabel"]
    assert payload["subscription"]["currentPlan"]
    assert payload["subscription"]["recentTransactions"]
    assert payload["support"]["supportEmail"]
    assert payload["dataControls"]["clearHistoryAvailable"] is True


def test_extended_settings_actions_and_search_endpoint_exist(client):
    ai = client.put(
        "/api/settings/ai-preferences",
        json={"responseStyle": "Concise", "proactiveSuggestions": False},
    )
    assert ai.status_code == 200
    assert ai.json()["aiPreferences"]["responseStyle"] == "Concise"
    assert ai.json()["aiPreferences"]["proactiveSuggestions"] is False

    region = client.put(
        "/api/settings/region",
        json={"timezone": "(GMT+00:00) London"},
    )
    assert region.status_code == 200
    assert region.json()["region"]["timezone"] == "(GMT+00:00) London"

    privacy = client.put(
        "/api/settings/privacy",
        json={"profileVisibility": "Private", "thirdPartySharing": True},
    )
    assert privacy.status_code == 200
    assert privacy.json()["privacy"]["profileVisibility"] == "Private"
    assert privacy.json()["privacy"]["thirdPartySharing"] is True

    client.post(
        "/api/advisor/chat",
        json={"message": "What scholarships am I eligible for?", "history": []},
    )
    cleared = client.post("/api/settings/history/clear")
    assert cleared.status_code == 200
    assert cleared.json()["success"] is True
    assert client.get("/api/advisor/bootstrap").json()["history"] == []

    feedback = client.post("/api/settings/feedback", json={"message": "Great frontend compatibility update"})
    assert feedback.status_code == 200
    assert feedback.json()["success"] is True

    search = client.get("/api/search?q=google")
    assert search.status_code == 200
    search_payload = search.json()
    assert search_payload["query"] == "google"
    assert search_payload["totalCount"] > 0
    assert any(item["type"] == "opportunity" for item in search_payload["results"])
    assert all(item["link"].startswith("/") for item in search_payload["results"])


def test_insights_and_settings_export_actions_exist(client):
    insights_export = client.post("/api/insights/export")
    assert insights_export.status_code == 200
    assert insights_export.json()["message"]

    deactivate = client.post("/api/settings/deactivate")
    assert deactivate.status_code == 200
    assert deactivate.json()["success"] is True

    delete = client.post("/api/settings/delete")
    assert delete.status_code == 200
    assert delete.json()["success"] is True
