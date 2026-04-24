from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

import pytest
import requests
from fastapi.testclient import TestClient


def _bootstrap_backend(monkeypatch: pytest.MonkeyPatch, tmp_path: Path, *, api_key: str) -> Path:
    repo_backend = Path(__file__).resolve().parents[1]
    source_data = repo_backend / "data"
    temp_data = tmp_path / "data"
    shutil.copytree(source_data, temp_data)
    monkeypatch.setenv("OPPORTUNIQ_DATA_DIR", str(temp_data))
    monkeypatch.setenv("ILMU_API_KEY", api_key)
    if str(repo_backend) not in sys.path:
        sys.path.insert(0, str(repo_backend))

    from app.config import get_settings
    from app.services.container import get_container

    get_settings.cache_clear()
    get_container.cache_clear()
    return temp_data


@pytest.fixture()
def api_client(monkeypatch, tmp_path: Path):
    _bootstrap_backend(monkeypatch, tmp_path, api_key="")
    from app.config import get_settings
    from app.services.container import get_container
    from app.main import app

    with TestClient(app) as test_client:
        yield test_client

    get_settings.cache_clear()
    get_container.cache_clear()


@pytest.fixture()
def service_container(monkeypatch, tmp_path: Path):
    _bootstrap_backend(monkeypatch, tmp_path, api_key="")
    from app.config import get_settings
    from app.services.container import get_container

    container = get_container()
    yield container

    get_settings.cache_clear()
    get_container.cache_clear()


@pytest.fixture()
def glm_service(monkeypatch, tmp_path: Path):
    _bootstrap_backend(monkeypatch, tmp_path, api_key="test-key")
    from app.config import get_settings
    from app.services.glm_service import GLMService
    from app.services.state_store import JsonStateStore

    settings = get_settings()
    store = JsonStateStore(settings)
    service = GLMService(settings, store)
    yield service

    get_settings.cache_clear()


def _sample_profile() -> dict[str, object]:
    return {
        "name": "Aisha Rahman",
        "course": "Computer Science",
        "faculty": "Engineering",
        "year": 3,
        "studyLevel": "Undergraduate",
        "goal": "Industry Experience",
        "skills": ["Python", "React", "SQL"],
        "interests": ["software engineering", "data analytics"],
        "assets": ["CV", "Transcript", "LinkedIn"],
    }


def _sample_opportunity() -> dict[str, object]:
    return {
        "id": "sample-internship",
        "title": "Software Engineering Internship",
        "company": "Example Tech",
        "category": "Internship",
        "deadline": "02 May 2026",
        "deadlineIso": "2026-05-02",
        "estimatedValue": "RM4,800",
        "estimatedValueRaw": 4800,
        "fitScore": 88,
        "urgencyScore": 82,
        "readinessScore": 72,
        "roiScore": 84,
        "priorityScore": 86,
        "pipelineStage": "apply-now",
        "missingRequirements": ["Portfolio"],
        "requiredDocuments": ["CV", "Portfolio", "Transcript"],
        "description": "Build production software with the engineering team.",
        "effort": "Medium",
        "eligibility": "High",
        "recommendation": "Strong match with meaningful upside.",
        "tradeoff": "Good balance of upside and effort.",
        "nextStep": "Prepare the portfolio and submit the application this week.",
        "risk": "Missing one required application asset.",
        "fitLabel": "High",
        "strategicValue": 88,
        "daysUntilDeadline": 7,
    }


def _sample_modules() -> list[dict[str, object]]:
    return [
        {"title": "CV / Resume", "completion": 92, "impact": "High", "status": "complete"},
        {"title": "Portfolio", "completion": 48, "impact": "High", "status": "warning"},
        {"title": "LinkedIn", "completion": 74, "impact": "Medium", "status": "warning"},
    ]


def _sample_tasks() -> list[dict[str, object]]:
    return [
        {
            "id": "task-1",
            "title": "Tailor CV for top internship",
            "subtitle": "Software Engineering Internship",
            "durationMinutes": 90,
            "completed": False,
            "type": "apply-now",
            "dueLabel": "Tomorrow",
            "duration": "1.5 hrs",
        },
        {
            "id": "task-2",
            "title": "Update portfolio projects",
            "subtitle": "Prepare Soon",
            "durationMinutes": 120,
            "completed": False,
            "type": "prepare-soon",
            "dueLabel": "Thu",
            "duration": "2 hrs",
        },
    ]


def test_prompt_builders_are_bounded_and_mode_specific(glm_service):
    profile = _sample_profile()
    opportunity = _sample_opportunity()

    dashboard = glm_service._build_dashboard_featured_request(profile, opportunity)
    assert "message" not in dashboard["user_payload"]
    assert "opportunity" in dashboard["user_payload"]
    assert dashboard["max_tokens"] <= 700

    detail = glm_service._build_opportunity_detail_request(profile, opportunity)
    assert len(detail["user_payload"]["opportunity"]["requiredDocuments"]) <= 6
    assert detail["max_tokens"] <= 900

    readiness = glm_service._build_readiness_summary_request(profile, _sample_modules(), [opportunity] * 4)
    assert len(readiness["user_payload"]["opportunities"]) == 3
    assert "behaviorSignals" in readiness["user_payload"]

    planner = glm_service._build_planner_strategy_request(profile, _sample_tasks() * 5, [opportunity] * 6)
    assert len(planner["user_payload"]["tasks"]) == 8
    assert len(planner["user_payload"]["opportunities"]) == 4

    insights = glm_service._build_insights_commentary_request(profile, {"pipelineValue": 12000})
    assert "metrics" in insights["user_payload"]
    assert "opportunities" not in insights["user_payload"]

    advisor = glm_service._build_advisor_reply_request(
        profile,
        "Which one should I prioritize?",
        [{"role": "user", "content": "older"}] * 8,
        {
            "topOpportunities": [opportunity] * 10,
            "scholarshipOpportunities": [opportunity] * 6,
            "readiness": {},
            "planner": {},
            "behaviorSignals": {},
        },
    )
    assert len(advisor["user_payload"]["history"]) == 4
    assert len(advisor["user_payload"]["context"]["topOpportunities"]) == 6
    assert len(advisor["user_payload"]["context"]["scholarshipOpportunities"]) == 4


def test_persistent_cache_hits_across_service_instances(glm_service, monkeypatch):
    from app.services.glm_service import GLMService

    profile = _sample_profile()
    opportunity = _sample_opportunity()
    request = glm_service._build_dashboard_featured_request(profile, opportunity)
    calls = {"count": 0}

    def fake_post(_: dict[str, object]) -> dict[str, object]:
        calls["count"] += 1
        return {
            "summary": "Live summary",
            "reasoningBullets": ["Bullet 1"],
            "tradeoff": "Tradeoff",
            "whyNotNow": "Why not now",
            "nextStep": "Next step",
            "economicImpact": "Economic impact",
            "confidenceScore": 88,
            "confidenceReason": "Strong context",
            "uncertainFields": [],
        }

    monkeypatch.setattr(glm_service, "_post_with_retries", fake_post)
    first = glm_service._request_json("dashboard_featured", request)
    assert first is not None
    assert calls["count"] == 1
    assert glm_service.cache_path.exists()

    second_service = GLMService(glm_service.settings, glm_service.store)
    monkeypatch.setattr(
        second_service,
        "_post_with_retries",
        lambda _: pytest.fail("cache should have satisfied the second request"),
    )
    second = second_service._request_json("dashboard_featured", request)
    assert second == first
    assert second_service.stats_snapshot()["cacheHits"] == 1


def test_cache_bypass_when_message_changes(glm_service, monkeypatch):
    profile = _sample_profile()
    context = {
        "topOpportunities": [_sample_opportunity()],
        "scholarshipOpportunities": [],
        "readiness": {},
        "planner": {},
        "behaviorSignals": {},
    }
    calls = {"count": 0}

    def fake_post(_: dict[str, object]) -> dict[str, object]:
        calls["count"] += 1
        return {"response": f"Response {calls['count']}"}

    monkeypatch.setattr(glm_service, "_post_with_retries", fake_post)
    first = glm_service._build_advisor_reply_request(profile, "Question one", [], context)
    second = glm_service._build_advisor_reply_request(profile, "Question two", [], context)

    glm_service._request_json("advisor_reply", first)
    glm_service._request_json("advisor_reply", second)

    assert calls["count"] == 2
    assert glm_service.stats_snapshot()["cacheMisses"] == 2


@pytest.mark.parametrize(
    "error",
    [
        ValueError("ILMU returned empty content with finish_reason=length"),
        json.JSONDecodeError("bad json", "x", 0),
        requests.Timeout("timed out"),
    ],
)
def test_fallback_normalization_on_model_errors(glm_service, monkeypatch, error):
    monkeypatch.setattr(
        glm_service,
        "_post_with_retries",
        lambda _: (_ for _ in ()).throw(error),
    )
    result = glm_service.explain_opportunity_detail(_sample_profile(), _sample_opportunity())
    assert result["source"] == "fallback"
    assert result["summary"]
    assert result["reasoningBullets"]
    assert isinstance(result["uncertainFields"], list)


def test_partial_glm_response_is_normalized(glm_service, monkeypatch):
    monkeypatch.setattr(
        glm_service,
        "_post_with_retries",
        lambda _: {"summary": "Tailored live summary"},
    )
    result = glm_service.explain_featured_recommendation(_sample_profile(), _sample_opportunity())
    assert result["source"] == "glm"
    assert result["summary"] == "Tailored live summary"
    assert result["reasoningBullets"]
    assert result["confidenceScore"] > 0


def test_confidence_and_uncertainty_respond_to_sparse_context(glm_service, monkeypatch):
    monkeypatch.setattr(
        glm_service,
        "_post_with_retries",
        lambda _: (_ for _ in ()).throw(requests.Timeout("timed out")),
    )
    strong = glm_service.explain_featured_recommendation(_sample_profile(), _sample_opportunity())
    weak_profile = {
        "name": "Student",
        "course": "",
        "faculty": "",
        "year": 1,
        "studyLevel": "Undergraduate",
        "goal": "",
        "skills": [],
        "interests": [],
        "assets": [],
    }
    weak_opportunity = {
        **_sample_opportunity(),
        "deadline": None,
        "deadlineIso": None,
        "fitScore": 52,
        "readinessScore": 28,
        "missingRequirements": ["CV", "Portfolio", "Transcript"],
    }
    weak = glm_service.explain_featured_recommendation(weak_profile, weak_opportunity)
    assert weak["confidenceScore"] < strong["confidenceScore"]
    assert "deadline" in weak["uncertainFields"]


def test_api_endpoints_expose_additive_ai_fields(api_client):
    dashboard = api_client.get("/api/dashboard").json()
    featured = dashboard["featuredRecommendation"]
    assert featured["aiExplanation"]["confidenceScore"] >= 0
    assert featured["aiExplanation"]["whyNotNow"]
    assert featured["economicImpact"]

    opportunities = api_client.get("/api/opportunities").json()
    first_item = opportunities["items"][0]
    assert "whyRecommended" in first_item
    assert "confidenceScore" in first_item

    detail = api_client.get(f"/api/opportunities/{first_item['id']}").json()
    assert detail["aiExplanation"]["confidenceReason"]
    assert detail["aiExplanation"]["economicImpact"]
    assert "estimatedValueUnlocked" in detail

    readiness = api_client.get("/api/readiness").json()
    assert readiness["aiExplanation"]["summary"]
    assert readiness["aiChecklist"][0]["unlockImpact"]

    planner = api_client.get("/api/planner").json()
    assert planner["aiExplanation"]["summary"]
    assert planner["aiExplanation"]["confidenceScore"] >= 0

    insights = api_client.get("/api/insights").json()
    assert insights["economicImpactNarrative"]
    assert insights["aiExplanation"]["economicImpact"]

    advisor = api_client.post(
        "/api/advisor/chat",
        json={"message": "What should I prioritize this week?", "history": []},
    ).json()
    assert advisor["source"] in {"glm", "fallback"}
    assert advisor["confidenceScore"] >= 0
    assert isinstance(advisor["uncertainFields"], list)
    assert advisor["aiExplanation"]["summary"]


@pytest.mark.parametrize(
    ("message", "expected_fragment"),
    [
        ("Which opportunities should I prioritize this week?", "Prioritize"),
        ("Show me high ROI opportunities", "ROI"),
        ("What scholarships am I eligible for?", "scholarship"),
        ("What am I missing based on my profile?", "gaps"),
        ("Help me plan my next 7 days", "next-step plan"),
        ("What fits my career goals best?", "current profile points"),
    ],
)
def test_advisor_reliability_across_question_families(api_client, message: str, expected_fragment: str):
    response = api_client.post("/api/advisor/chat", json={"message": message, "history": []})
    assert response.status_code == 200
    payload = response.json()
    assert payload["response"]
    assert expected_fragment.lower() in payload["response"].lower()
    assert payload["suggestedPrompts"]
    assert payload["confidenceReason"]


def _apply_profile_scenario(container, **updates):
    profile = container.screens._load_profile()
    assets = updates.pop("assets", None)
    updated = profile.model_copy(update=updates)
    if assets is not None:
        updated = updated.model_copy(update={"assets": assets})
    container.screens._save_profile(updated)
    container.screens._save_advisor_history([])


def test_scenario_profiles_produce_materially_different_outcomes(service_container):
    profile = service_container.screens._load_profile()

    internship_assets = profile.assets
    low_readiness_assets = [
        asset.model_copy(update={"completion": 20, "status": "Missing"})
        for asset in profile.assets
    ]

    scenarios = {
        "internship": {
            "course": "Computer Science",
            "faculty": "Engineering",
            "goal": "Industry Experience",
            "cgpaMin": 3.4,
            "cgpaMax": 3.8,
            "skills": ["Python", "React", "SQL"],
            "interests": ["software engineering", "data"],
            "assets": internship_assets,
            "question": "Which opportunities should I prioritize this week?",
        },
        "scholarship": {
            "course": "Economics",
            "faculty": "Business",
            "goal": "Postgraduate Scholarship",
            "cgpaMin": 3.85,
            "cgpaMax": 4.0,
            "skills": ["Research", "Writing"],
            "interests": ["policy", "research"],
            "assets": internship_assets,
            "question": "What scholarships am I eligible for?",
        },
        "low_readiness": {
            "course": "Computer Science",
            "faculty": "Engineering",
            "goal": "Industry Experience",
            "cgpaMin": 3.1,
            "cgpaMax": 3.3,
            "skills": ["Python"],
            "interests": ["software engineering"],
            "assets": low_readiness_assets,
            "question": "What am I missing based on my profile?",
        },
        "grant": {
            "course": "Entrepreneurship",
            "faculty": "Business",
            "goal": "Startup Funding",
            "cgpaMin": 3.2,
            "cgpaMax": 3.6,
            "skills": ["Pitching", "Product Strategy"],
            "interests": ["startup", "innovation", "venture"],
            "assets": internship_assets,
            "question": "What fits my career goals best?",
        },
    }

    outputs: dict[str, dict[str, object]] = {}
    for name, scenario in scenarios.items():
        question = str(scenario.pop("question"))
        _apply_profile_scenario(service_container, **scenario)
        dashboard = service_container.screens.get_dashboard()
        readiness = service_container.screens.get_readiness()
        advisor = service_container.screens.advisor_chat(question, [])
        outputs[name] = {
            "featuredCategory": dashboard["featuredRecommendation"]["category"],
            "recommendedAction": dashboard["featuredRecommendation"]["recommendedAction"],
            "tradeoff": dashboard["featuredRecommendation"]["tradeoff"],
            "readiness": readiness["overallReadiness"],
            "firstBlocker": readiness["blockers"][0]["name"] if readiness["blockers"] else "",
            "advisor": advisor["response"],
        }

    assert outputs["internship"]["featuredCategory"] in {"Internship", "Programme"}
    assert outputs["scholarship"]["featuredCategory"] == "Scholarship"
    assert outputs["low_readiness"]["recommendedAction"] in {"prepare-soon", "track-later"}
    assert outputs["grant"]["featuredCategory"] in {"Grant", "Competition", "Programme"}
    assert outputs["internship"]["tradeoff"] != outputs["scholarship"]["tradeoff"]
    assert outputs["low_readiness"]["readiness"] < outputs["internship"]["readiness"]
    assert outputs["grant"]["advisor"] != outputs["scholarship"]["advisor"]
