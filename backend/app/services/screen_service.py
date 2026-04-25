from __future__ import annotations

import calendar
from datetime import date, datetime
from pathlib import Path
from typing import Any
from uuid import uuid4

from app.config import Settings
from app.models import (
    AdvisorMessageState,
    ApplicationState,
    DocumentState,
    OpportunitySeed,
    PlannerTaskState,
    PreferenceState,
    ProfileState,
    ResourceState,
    SettingsDetailState,
)
from app.services.catalog_service import CatalogService
from app.services.glm_service import GLMService
from app.services.scoring_service import ScoringService
from app.services.state_store import JsonStateStore


class ScreenService:
    def __init__(
        self,
        *,
        settings: Settings,
        store: JsonStateStore,
        catalog: CatalogService,
        scoring: ScoringService,
        glm: GLMService,
    ) -> None:
        self.settings = settings
        self.store = store
        self.catalog = catalog
        self.scoring = scoring
        self.glm = glm

    def _load_profile(self) -> ProfileState:
        return self.store.load_model(
            self.store.statePath("profile.json"),
            ProfileState,
            default={},
        )

    def _save_profile(self, profile: ProfileState) -> None:
        self.store.save_model(self.store.statePath("profile.json"), profile)

    def _load_applications(self) -> list[ApplicationState]:
        return self.store.load_model(
            self.store.statePath("applications.json"),
            list[ApplicationState],
            default=[],
        )

    def _save_applications(self, applications: list[ApplicationState]) -> None:
        self.store.save_model(self.store.statePath("applications.json"), applications)

    def _load_documents(self) -> list[DocumentState]:
        return self.store.load_model(
            self.store.statePath("documents.json"),
            list[DocumentState],
            default=[],
        )

    def _save_documents(self, documents: list[DocumentState]) -> None:
        self.store.save_model(self.store.statePath("documents.json"), documents)

    def _load_planner(self) -> list[PlannerTaskState]:
        return self.store.load_model(
            self.store.statePath("planner.json"),
            list[PlannerTaskState],
            default=[],
        )

    def _save_planner(self, tasks: list[PlannerTaskState]) -> None:
        self.store.save_model(self.store.statePath("planner.json"), tasks)

    def _load_preferences(self) -> list[PreferenceState]:
        return self.store.load_model(
            self.store.statePath("settings.json"),
            list[PreferenceState],
            default=[],
        )

    def _save_preferences(self, preferences: list[PreferenceState]) -> None:
        self.store.save_model(self.store.statePath("settings.json"), preferences)

    def _load_settings_detail(self) -> SettingsDetailState:
        return self.store.load_model(
            self.store.statePath("settings_detail.json"),
            SettingsDetailState,
            default={},
        )

    def _save_settings_detail(self, detail: SettingsDetailState) -> None:
        self.store.save_model(self.store.statePath("settings_detail.json"), detail)

    def _load_network(self) -> dict[str, Any]:
        return self.store.load_json(
            self.store.statePath("network.json"),
            default={"connections": [], "suggestedConnections": []},
        )

    def _save_network(self, payload: dict[str, Any]) -> None:
        self.store.save_json(self.store.statePath("network.json"), payload)

    def _load_resources(self) -> ResourceState:
        return self.store.load_model(
            self.store.statePath("resources.json"),
            ResourceState,
            default={"resources": [], "webinars": []},
        )

    def _load_advisor_history(self) -> list[AdvisorMessageState]:
        return self.store.load_model(
            self.store.statePath("advisor_history.json"),
            list[AdvisorMessageState],
            default=[],
        )

    def _save_advisor_history(self, history: list[AdvisorMessageState]) -> None:
        self.store.save_model(self.store.statePath("advisor_history.json"), history)

    def _load_pipeline_overrides(self) -> dict[str, str]:
        return self.store.load_json(
            self.store.statePath("pipeline_overrides.json"),
            default={},
        )

    def _save_pipeline_overrides(self, overrides: dict[str, str]) -> None:
        self.store.save_json(self.store.statePath("pipeline_overrides.json"), overrides)

    def _profile_summary(self, profile: ProfileState) -> dict[str, Any]:
        return {
            "name": profile.name,
            "course": profile.course,
            "faculty": profile.faculty,
            "year": profile.year,
            "studyLevel": profile.studyLevel,
            "cgpaRange": [profile.cgpaMin, profile.cgpaMax],
            "goal": profile.goal,
            "timeAvailability": profile.timeAvailability,
            "readinessLevel": profile.readinessLevel,
            "skills": profile.skills,
            "interests": profile.interests,
            "assets": [asset.label for asset in profile.assets],
        }

    def _canonical_opportunity_aliases(self) -> dict[str, str]:
        return {
            "petronas-2025": "petronas-2026",
            "google-step-2025": "google-step-2026",
            "google-2025": "google-step-2026",
            "maybank-ytp-2025": "maybank-ytp-2026",
            "maybank-2025": "maybank-ytp-2026",
            "shell-grad-2026": "shell-grad-2027",
            "shell-2025": "shell-grad-2027",
            "microsoft-mlsa-2025": "microsoft-mlsa-2026",
            "microsoft-2025": "microsoft-mlsa-2026",
            "adb-japan-2025": "adb-japan-2026",
            "adb-2025": "adb-japan-2026",
            "asian-development-bank-2025": "adb-japan-2026",
            "khazanah-2026": "khazanah-scholar-2027",
            "khazanah-scholar-2026": "khazanah-scholar-2027",
            "icpc-2025": "icpc-2026",
            "hackathon-series-2025": "hackathon-series-2026",
        }

    def _resolve_opportunity_id(self, opportunity_id: str) -> str:
        normalized = opportunity_id.strip().lower()
        alias = self._canonical_opportunity_aliases().get(normalized)
        if alias:
            return alias

        company_aliases = {
            "petronas": "petronas-2026",
            "google": "google-step-2026",
            "maybank": "maybank-ytp-2026",
            "shell": "shell-grad-2027",
            "microsoft": "microsoft-mlsa-2026",
            "adb": "adb-japan-2026",
            "asian-development-bank": "adb-japan-2026",
            "khazanah": "khazanah-scholar-2027",
            "icpc": "icpc-2026",
            "hackathon": "hackathon-series-2026",
            "experian": "experian-se-2026",
            "airasia": "airasia-data-2026",
            "watsons": "watsons-intern-2026",
            "aws": "aws-cert-challenge-2026",
            "cradle": "cradle-grant-2026",
        }
        for token, canonical in company_aliases.items():
            if token in normalized:
                return canonical
        return opportunity_id

    def _normalize_category_filter(self, category: str | None) -> str | None:
        if category is None:
            return None
        normalized = category.strip().lower()
        aliases = {
            "all": "all",
            "scholarships": "scholarship",
            "scholarship": "scholarship",
            "internships": "internship",
            "internship": "internship",
            "competitions": "competition",
            "competition": "competition",
            "grants": "grant",
            "grant": "grant",
            "certifications": "certification",
            "certification": "certification",
            "programmes": "programme",
            "programme": "programme",
            "programs": "programme",
            "program": "programme",
        }
        return aliases.get(normalized, normalized)

    def _normalize_sort(self, sort: str) -> str:
        normalized = sort.strip().lower().replace("_", "-").replace(" ", "-")
        aliases = {
            "best-match": "best-match",
            "highest-roi": "highest-roi",
            "most-urgent": "most-urgent",
            "low-effort": "low-effort",
            "sort=internships": "best-match",
        }
        return aliases.get(normalized, "best-match")

    def _stage_next_step(self, stage: str) -> str:
        if stage == "apply-now":
            return "Start the application this week and submit before the deadline window tightens."
        if stage == "prepare-soon":
            return "Close the missing readiness gaps first, then begin the application."
        if stage == "track-later":
            return "Save it, monitor the deadline, and revisit when your profile is stronger."
        return "Do not spend time here yet unless your goals shift."

    def _behavior_signals(
        self,
        profile: ProfileState,
        evaluations: list[dict[str, Any]],
    ) -> dict[str, Any]:
        category_weights: dict[str, int] = {}
        evaluation_lookup = {item["id"]: item for item in evaluations}
        for opportunity_id in profile.savedOpportunityIds:
            item = evaluation_lookup.get(opportunity_id)
            if item:
                category_weights[item["category"]] = category_weights.get(item["category"], 0) + 3

        for application in self._load_applications():
            item = evaluation_lookup.get(application.opportunityId)
            if item:
                category_weights[item["category"]] = category_weights.get(item["category"], 0) + 4

        for task in self._load_planner():
            if task.completed and task.opportunityId:
                item = evaluation_lookup.get(task.opportunityId)
                if item:
                    category_weights[item["category"]] = category_weights.get(item["category"], 0) + 2

        advisor_history = self._load_advisor_history()[-8:]
        repeated_topics: dict[str, int] = {}
        for message in advisor_history:
            content = message.content.lower()
            for keyword, label in [
                ("internship", "Internship"),
                ("scholarship", "Scholarship"),
                ("grant", "Grant"),
                ("competition", "Competition"),
                ("certificate", "Certification"),
                ("certification", "Certification"),
            ]:
                if keyword in content:
                    repeated_topics[label] = repeated_topics.get(label, 0) + 1
                    category_weights[label] = category_weights.get(label, 0) + 1

        preferred_categories = [
            category
            for category, _ in sorted(
                category_weights.items(),
                key=lambda item: (-item[1], item[0]),
            )
        ]

        return {
            "preferredCategories": preferred_categories[:3],
            "savedOpportunityIds": list(profile.savedOpportunityIds),
            "applicationOpportunityIds": [item.opportunityId for item in self._load_applications()],
            "completedPlannerTaskCount": len([task for task in self._load_planner() if task.completed]),
            "recentAdvisorTopics": [
                topic
                for topic, _ in sorted(repeated_topics.items(), key=lambda item: (-item[1], item[0]))
            ],
        }

    def _goal_focus_categories(self, goal: str) -> set[str]:
        normalized = goal.lower()
        if "industry" in normalized or "internship" in normalized:
            return {"Internship", "Programme"}
        if "scholar" in normalized or "postgraduate" in normalized:
            return {"Scholarship"}
        if "startup" in normalized or "grant" in normalized or "funding" in normalized:
            return {"Grant", "Competition", "Programme"}
        if "certification" in normalized or "certificate" in normalized:
            return {"Certification", "Programme"}
        if "competition" in normalized:
            return {"Competition"}
        return set()

    def _select_featured_recommendation(
        self,
        profile: ProfileState,
        evaluations: list[dict[str, Any]],
        behavior_signals: dict[str, Any],
    ) -> dict[str, Any] | None:
        visible = [item for item in evaluations if item["pipelineStage"] != "skip"][:3] or evaluations[:3]
        if not visible:
            return None
        preferred = set(behavior_signals.get("preferredCategories", []))
        goal_focus = self._goal_focus_categories(profile.goal)
        return max(
            visible,
            key=lambda item: (
                item["priorityScore"]
                + (10 if item["category"] in goal_focus else 0)
                + (8 if item["category"] in preferred else 0)
                + (4 if item["id"] in behavior_signals.get("savedOpportunityIds", []) else 0),
                item["fitScore"],
                item["roiScore"],
            ),
        )

    def _enhance_visible_items(
        self,
        profile: ProfileState,
        items: list[dict[str, Any]],
        *,
        limit: int = 3,
    ) -> list[dict[str, Any]]:
        if not items:
            return []
        visible = [item for item in items if item["pipelineStage"] != "skip"][:limit]
        if not visible:
            visible = items[:limit]
        enhancements = self.glm.explain_candidates(self._profile_summary(profile), visible)

        enhanced_items: list[dict[str, Any]] = []
        for item in items:
            enhanced = {**item}
            if item["id"] in enhancements:
                ai = enhancements[item["id"]]
                enhanced.update(
                    {
                        "recommendedAction": ai["recommendedAction"],
                        "recommendation": ai["reasoningSummary"],
                        "tradeoff": ai["tradeoff"],
                        "whyNotNow": ai["whyNotNow"],
                        "nextStep": ai["nextStep"],
                        "topPickRationale": ai["topPickRationale"],
                        "confidenceScore": ai["confidenceScore"],
                        "confidenceReason": ai["confidenceReason"],
                        "uncertainFields": ai["uncertainFields"],
                        "whyRecommended": ai["whyRecommended"],
                        "economicImpact": ai["economicImpact"],
                        "estimatedValueUnlocked": ai["estimatedValueUnlocked"],
                        "valueAtRisk": ai["valueAtRisk"],
                        "timeSavedEstimate": ai["timeSavedEstimate"],
                        "strategicValueNarrative": ai["strategicValueNarrative"],
                        "aiExplanation": {
                            "summary": ai["reasoningSummary"],
                            "reasoningBullets": ai["reasoningBullets"],
                            "tradeoff": ai["tradeoff"],
                            "whyNotNow": ai["whyNotNow"],
                            "nextStep": ai["nextStep"],
                            "economicImpact": ai["economicImpact"],
                            "confidenceScore": ai["confidenceScore"],
                            "confidenceReason": ai["confidenceReason"],
                            "uncertainFields": ai["uncertainFields"],
                            "source": ai["source"],
                        },
                    }
                )
            enhanced_items.append(enhanced)
        return enhanced_items

    def _evaluated_opportunities(
        self,
        *,
        augment_with_glm: bool = False,
    ) -> tuple[ProfileState, list[DocumentState], list[dict[str, Any]]]:
        profile = self._load_profile()
        documents = self._load_documents()
        overrides = self._load_pipeline_overrides()
        evaluations = self.scoring.evaluate(
            profile,
            self.catalog.list_opportunities(),
            documents,
        )
        saved_ids = set(profile.savedOpportunityIds)
        for item in evaluations:
            override_stage = overrides.get(item["id"])
            if override_stage in {"apply-now", "prepare-soon", "track-later", "skip"}:
                item["pipelineStage"] = override_stage
                item["recommendedAction"] = override_stage
                item["nextStep"] = self._stage_next_step(override_stage)
            item["saved"] = item["id"] in saved_ids
            item["recommendedAction"] = item.get("recommendedAction", item["pipelineStage"])
            item["legacyAliases"] = [
                alias
                for alias, canonical in self._canonical_opportunity_aliases().items()
                if canonical == item["id"]
            ]
        if augment_with_glm:
            top_candidates = [item for item in evaluations if item["pipelineStage"] != "skip"][:4]
            enhancements = self.glm.explain_candidates(self._profile_summary(profile), top_candidates)
            for item in evaluations:
                if item["id"] in enhancements:
                    enhancement = enhancements[item["id"]]
                    item["recommendedAction"] = enhancement.get(
                        "recommendedAction", item["pipelineStage"]
                    )
                    item["recommendation"] = enhancement.get("reasoningSummary", item["recommendation"])
                    item["tradeoff"] = enhancement.get("tradeoff", item["tradeoff"])
                    item["risk"] = enhancement.get("risk", item["risk"])
                    item["nextStep"] = enhancement.get("nextStep", item["nextStep"])
                    item["fitLabel"] = enhancement.get("fitLabel", item["fitLabel"])
                    item["topPickRationale"] = enhancement.get("topPickRationale")
                    item["readinessGap"] = enhancement.get("readinessGap")
        if evaluations:
            evaluations[0]["topPick"] = True
        return profile, documents, evaluations

    def _build_pipeline_summary(self, evaluations: list[dict[str, Any]]) -> dict[str, Any]:
        stage_counts = {stage: 0 for stage in ["apply-now", "prepare-soon", "track-later", "skip"]}
        total_value = 0
        expiring_value = 0
        high_fit_count = 0
        for item in evaluations:
            stage_counts[item["pipelineStage"]] += 1
            total_value += int(item["estimatedValueRaw"])
            if item["fitScore"] >= 80:
                high_fit_count += 1
            if item["daysUntilDeadline"] is not None and item["daysUntilDeadline"] <= 30:
                expiring_value += int(item["estimatedValueRaw"])

        applications = self._load_applications()
        interviews_count = sum(1 for app in applications if app.interviewDate)
        return {
            "totalEstimatedValue": total_value,
            "totalOpportunities": len(evaluations),
            "highFitCount": high_fit_count,
            "applicationsCount": len(applications),
            "interviewsCount": interviews_count,
            "expiringValue": expiring_value,
            "stageCounts": stage_counts,
        }

    def _readiness_modules(
        self,
        profile: ProfileState,
        documents: list[DocumentState],
        evaluations: list[dict[str, Any]],
    ) -> tuple[int, list[dict[str, Any]], list[dict[str, Any]]]:
        asset_lookup = {asset.id: asset for asset in profile.assets}
        document_lookup = {document.category.lower(): document for document in documents}

        module_templates = [
            ("cv", "CV / Resume", "Showcase your skills and experience", "High", "Improve Now", "/documents"),
            ("transcript", "Transcript", "Academic performance and core coursework", "High", "View", "/documents"),
            ("portfolio", "Portfolio", "Projects that demonstrate your skills", "High", "Upload Project", "/documents"),
            ("linkedin", "LinkedIn", "Professional presence and networking", "Medium", "Improve Now", "/network"),
            ("essay", "Essay / Personal Statement", "Your story, goals, and motivation", "High", "Improve Now", "/documents"),
            ("referee", "Referee", "Recommendations from mentors", "Medium", "Add Referee", "/network"),
            ("certificates", "Certificates", "Certifications and achievements", "Medium", "Upload Certificate", "/documents"),
            ("profile", "Profile Completeness", "Personal details and preferences", "High", "Complete Now", "/profile"),
        ]

        modules: list[dict[str, Any]] = []
        for module_id, title, description, impact, action, href in module_templates:
            if module_id == "profile":
                filled_fields = [
                    bool(profile.course),
                    bool(profile.faculty),
                    bool(profile.interests),
                    bool(profile.skills),
                    bool(profile.goal),
                    bool(profile.timeAvailability),
                ]
                completion = int(sum(1 for field in filled_fields if field) / len(filled_fields) * 100)
            else:
                asset = asset_lookup.get(module_id)
                if asset:
                    completion = asset.completion
                else:
                    document = document_lookup.get(title.lower())
                    completion = 85 if document and document.status == "ready" else 25

            status = "complete" if completion >= 80 else "warning" if completion >= 50 else "critical"
            suggestions = None
            if completion < 100:
                suggestions = {
                    "CV / Resume": "Add 2 quantified achievements to sharpen impact.",
                    "Transcript": "Keep a fresh transcript PDF ready for applications.",
                    "Portfolio": "Add 2 more outcomes-focused projects.",
                    "LinkedIn": "Strengthen your headline and core skills section.",
                    "Essay / Personal Statement": "Clarify motivation and evidence of fit.",
                    "Referee": "Secure one academic or industry referee early.",
                    "Certificates": "Upload the certificates most relevant to your target roles.",
                    "Profile Completeness": "Fill every profile field so matching gets sharper.",
                }[title]

            modules.append(
                {
                    "id": module_id,
                    "title": title,
                    "description": description,
                    "completion": completion,
                    "impact": impact,
                    "action": action,
                    "href": href,
                    "status": status,
                    "suggestions": suggestions,
                }
            )

        overall = int(sum(module["completion"] for module in modules) / len(modules))

        blockers: list[dict[str, Any]] = []
        for evaluation in evaluations[:3]:
            if evaluation["missingRequirements"]:
                blockers.append(
                    {
                        "name": evaluation["title"],
                        "impact": f"{min(24, len(evaluation['missingRequirements']) * 6)}%",
                        "missingRequirements": evaluation["missingRequirements"],
                    }
                )
        return overall, modules, blockers

    def _profile_strength(
        self,
        profile: ProfileState,
        overall_readiness: int,
        evaluations: list[dict[str, Any]],
    ) -> dict[str, int]:
        completeness = min(
            100,
            int(
                (
                    40
                    + (10 if profile.skills else 0)
                    + (10 if profile.interests else 0)
                    + (10 if profile.goal else 0)
                    + (10 if profile.timeAvailability else 0)
                    + (20 if profile.assets else 0)
                )
            ),
        )
        relevance = int(sum(item["fitScore"] for item in evaluations[:5]) / max(len(evaluations[:5]), 1))
        engagement = min(100, 50 + len(profile.savedOpportunityIds) * 10)
        return {
            "completeness": completeness,
            "assets": overall_readiness,
            "relevance": relevance,
            "engagement": engagement,
        }

    def _planner_snapshot(self, tasks: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int, float]:
        categories = []
        total_minutes = sum(task["durationMinutes"] for task in tasks)
        for title, stage, note in [
            ("Apply Now", "apply-now", "High ROI"),
            ("Prepare Soon", "prepare-soon", "Medium ROI"),
            ("Track Later", "track-later", "Lower urgency"),
            ("Skip for Now", "skip", "Low ROI"),
        ]:
            stage_tasks = [task for task in tasks if task["type"] == stage]
            categories.append(
                {
                    "title": title,
                    "count": len(stage_tasks),
                    "effort": f"{round(sum(task['durationMinutes'] for task in stage_tasks) / 60, 1)} hrs",
                    "roi": note,
                }
            )

        focus_score = min(
            100,
            int(
                (
                    sum(
                        task["durationMinutes"]
                        for task in tasks
                        if task["type"] in {"apply-now", "prepare-soon"}
                    )
                    / max(total_minutes, 1)
                )
                * 100
            ),
        )
        return categories, focus_score, round(total_minutes / 60, 1)

    def _build_featured_recommendation(
        self,
        profile: ProfileState,
        featured: dict[str, Any] | None,
    ) -> dict[str, Any] | None:
        if featured is None:
            return None

        ai = self.glm.explain_featured_recommendation(
            self._profile_summary(profile),
            featured,
        )
        return {
            **featured,
            "recommendedAction": ai["recommendedAction"],
            "summary": ai["summary"],
            "whyTopMatchBullets": ai["reasoningBullets"],
            "tradeoff": ai["tradeoff"],
            "whyNotNow": ai["whyNotNow"],
            "topPickRationale": ai["topPickRationale"],
            "nextStep": ai["nextStep"],
            "economicImpact": ai["economicImpact"],
            "estimatedValueUnlocked": ai["estimatedValueUnlocked"],
            "valueAtRisk": ai["valueAtRisk"],
            "timeSavedEstimate": ai["timeSavedEstimate"],
            "strategicValueNarrative": ai["strategicValueNarrative"],
            "confidenceScore": ai["confidenceScore"],
            "confidenceReason": ai["confidenceReason"],
            "uncertainFields": ai["uncertainFields"],
            "explanationSource": ai["source"],
            "aiExplanation": {
                "summary": ai["summary"],
                "reasoningBullets": ai["reasoningBullets"],
                "tradeoff": ai["tradeoff"],
                "whyNotNow": ai["whyNotNow"],
                "nextStep": ai["nextStep"],
                "economicImpact": ai["economicImpact"],
                "confidenceScore": ai["confidenceScore"],
                "confidenceReason": ai["confidenceReason"],
                "uncertainFields": ai["uncertainFields"],
                "source": ai["source"],
            },
        }

    def health(self) -> dict[str, Any]:
        return {
            "status": "ok",
            "appName": self.settings.appName,
            "glmConfigured": self.glm.enabled,
            "model": self.settings.zAiModel,
            "seedCounts": {
                "opportunities": len(self.catalog.list_opportunities()),
                "applications": len(self._load_applications()),
                "documents": len(self._load_documents()),
                "plannerTasks": len(self._load_planner()),
            },
            "aiStats": self.glm.stats_snapshot(),
        }

    def get_profile(self) -> dict[str, Any]:
        profile, documents, evaluations = self._evaluated_opportunities()
        overall, modules, _ = self._readiness_modules(profile, documents, evaluations)
        profile_strength = self._profile_strength(profile, overall, evaluations)
        top_matches = []
        category_labels = []
        for evaluation in evaluations:
            label = f"{evaluation['category']}s"
            if label not in category_labels:
                category_labels.append(label)
                top_matches.append(
                    {
                        "label": f"{evaluation['title'].split()[0]} {evaluation['category']}",
                        "match": f"{evaluation['fitLabel']} Match",
                        "color": "text-green-600" if evaluation["fitScore"] >= 80 else "text-orange-600",
                    }
                )
            if len(top_matches) == 3:
                break

        return {
            "profile": profile.model_dump(mode="json"),
            "aiProfileSummary": {
                "matchQuality": "Excellent" if overall >= 85 else "Good" if overall >= 70 else "Improving",
                "matchQualityScore": overall,
                "bestSuited": top_matches,
            },
            "improvementTips": [
                {"tip": "Add a portfolio link", "sub": "Profiles with portfolios get more high-fit matches."},
                {"tip": "Keep your transcript updated", "sub": "Fresh academic proof helps with scholarships and internships."},
                {"tip": "Expand your skills list", "sub": "More explicit skills sharpen matching."},
                {"tip": "Upload certificates", "sub": "Certifications strengthen proof of readiness."},
            ],
            "profileStrength": profile_strength,
            "assets": [asset.model_dump(mode="json") for asset in profile.assets],
            "readinessModules": modules,
        }

    def update_profile(self, payload: dict[str, Any]) -> dict[str, Any]:
        profile = self._load_profile()
        updated = profile.model_copy(update={key: value for key, value in payload.items() if value is not None})
        if updated.firstName != updated.name.split()[0]:
            updated = updated.model_copy(update={"firstName": updated.name.split()[0]})
        self._save_profile(updated)
        return self.get_profile()

    def get_dashboard(self) -> dict[str, Any]:
        profile, documents, evaluations = self._evaluated_opportunities()
        overall, modules, _ = self._readiness_modules(profile, documents, evaluations)
        summary = self._build_pipeline_summary(evaluations)
        tasks = []
        for task in self._load_planner()[:5]:
            payload = task.model_dump(mode="json")
            payload["done"] = payload["completed"]
            tasks.append(payload)
        behavior_signals = self._behavior_signals(profile, evaluations)
        featured = self._build_featured_recommendation(
            profile,
            self._select_featured_recommendation(profile, evaluations, behavior_signals),
        )
        prompt_suggestions = [
            "What should I apply for this week?",
            "Which opportunities give me the best ROI?",
            "What am I missing based on my profile?",
        ]
        return {
            "user": profile.model_dump(mode="json"),
            "pipelineSummary": summary,
            "featuredRecommendation": featured,
            "stageBuckets": {
                stage: [item for item in evaluations if item["pipelineStage"] == stage]
                for stage in ["apply-now", "prepare-soon", "track-later", "skip"]
            },
            "readinessItems": [
                {
                    "id": module["id"],
                    "label": module["title"],
                    "percentage": module["completion"],
                    "status": module["status"],
                }
                for module in modules
            ],
            "plannerTasks": tasks,
            "weeklyInsight": {
                "timeSavedHours": round(max(5.5, len(evaluations) * 0.42), 1),
                "timeSavedChange": 18,
                "matchesFound": len([item for item in evaluations if item["pipelineStage"] != "skip"]),
                "matchesChange": 26,
                "valueUnlocked": summary["totalEstimatedValue"],
                "valueUnlockedChange": 22,
            },
            "overallReadiness": overall,
            "aiPromptSuggestions": prompt_suggestions,
            "behaviorSignals": behavior_signals,
        }

    def get_opportunities(
        self,
        *,
        category: str | None = None,
        stage: str | None = None,
        sort: str = "best-match",
        search: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> dict[str, Any]:
        profile, _, evaluations = self._evaluated_opportunities()
        items = evaluations
        normalized_category = self._normalize_category_filter(category)
        if normalized_category and normalized_category != "all":
            items = [item for item in items if item["category"].lower() == normalized_category]
        if stage:
            items = [item for item in items if item["pipelineStage"] == stage]
        if search:
            token = search.lower()
            items = [
                item
                for item in items
                if token in item["title"].lower() or token in item["company"].lower()
            ]

        normalized_sort = self._normalize_sort(sort)
        if normalized_sort == "highest-roi":
            items.sort(key=lambda item: item["roiScore"], reverse=True)
        elif normalized_sort == "most-urgent":
            items.sort(key=lambda item: item["urgencyScore"], reverse=True)
        elif normalized_sort == "low-effort":
            effort_order = {"Low": 0, "Medium": 1, "High": 2}
            items.sort(key=lambda item: (effort_order[item["effort"]], -item["fitScore"]))
        else:
            items.sort(key=lambda item: item["priorityScore"], reverse=True)

        items = self._enhance_visible_items(profile, items, limit=3)
        sliced = items[offset : offset + limit]
        top_three = items[:3]
        why_recommended = [
            "Matched to your academic profile, interests, and current goals.",
            "Balanced for fit, value, urgency, and realistic effort.",
            "Prioritised to reduce missed economic value before deadlines pass.",
        ]
        return {
            "profileContext": {
                "course": profile.course,
                "year": profile.year,
                "cgpaRange": f"{profile.cgpaMin:.2f} - {profile.cgpaMax:.2f}",
                "goal": profile.goal,
            },
            "totalCount": len(items),
            "items": sliced,
            "comparison": {
                "label": "Top 3 Picks",
                "items": [
                    {
                        "id": item["id"],
                        "name": item["title"],
                        "type": item["category"],
                        "score": item["fitScore"],
                        "whyRecommended": item.get("whyRecommended", item["recommendation"]),
                        "confidenceScore": item.get("confidenceScore"),
                    }
                    for item in top_three
                ],
            },
            "whyRecommended": why_recommended,
            "availableCategories": ["All", "Scholarships", "Internships", "Competitions", "Grants", "Certifications", "Programmes"],
        }

    def get_opportunity_detail(self, opportunity_id: str) -> dict[str, Any] | None:
        profile, documents, evaluations = self._evaluated_opportunities()
        resolved_id = self._resolve_opportunity_id(opportunity_id)
        evaluation = next((item for item in evaluations if item["id"] == resolved_id), None)
        if evaluation is None:
            return None
        detail = self.glm.explain_opportunity_detail(self._profile_summary(profile), evaluation)
        economic_value = int((evaluation["estimatedValueRaw"] or 0) * (1.8 if evaluation["category"] in {"Internship", "Programme"} else 1.0))
        if economic_value == 0:
            economic_value = int(evaluation["fitScore"] * 180)
        required_documents = []
        asset_lookup = {asset.label.lower(): asset for asset in profile.assets}
        for requirement in evaluation["requiredDocuments"] or []:
            token = requirement.lower()
            asset = next((asset for label, asset in asset_lookup.items() if token in label or label in token), None)
            status = "Required"
            action = None
            if requirement in evaluation["missingRequirements"]:
                action = "Improve Now"
            if requirement.lower() in {"portfolio", "portfolio / project links"}:
                status = "Recommended"
            required_documents.append(
                {
                    "name": requirement,
                    "status": status,
                    "action": action,
                    "ready": bool(asset and asset.completion >= 60),
                }
            )

        checklist = [
            {"label": "Review role and requirements", "done": True},
            {"label": "Prepare and tailor your application assets", "done": True if evaluation["readinessScore"] >= 65 else False},
            {"label": "Complete the official application form", "done": False},
            {"label": "Complete any assessments or screening tasks", "done": False},
            {"label": "Attend interview or follow-up stage", "done": False},
        ]
        standing = max(5, 100 - evaluation["fitScore"])
        competition_info = {
            "estimatedApplicants": f"{1200 + standing * 18}+",
            "selectionRate": f"~{max(4, 18 - standing // 6)}%",
            "standing": f"Top {standing}%",
        }
        return {
            "id": evaluation["id"],
            "requestedId": opportunity_id,
            "title": evaluation["title"],
            "company": evaluation["company"],
            "logo": evaluation["logo"],
            "topPick": evaluation["topPick"],
            "verified": evaluation["verified"],
            "category": evaluation["category"],
            "deadline": evaluation["deadline"],
            "estimatedValue": evaluation["estimatedValue"],
            "location": evaluation["location"],
            "type": evaluation["type"],
            "fitScore": evaluation["fitScore"],
            "fitLabel": evaluation["fitLabel"],
            "urgencyScore": evaluation["urgencyScore"],
            "urgencyLabel": evaluation["urgencyLabel"],
            "economicValue": economic_value,
            "effortLevel": evaluation["effort"],
            "recommendedAction": detail["recommendedAction"],
            "summary": detail["summary"],
            "reasoningBullets": detail["reasoningBullets"],
            "tradeoff": detail["tradeoff"],
            "whyNotNow": detail["whyNotNow"],
            "nextStep": detail["nextStep"],
            "economicImpact": detail["economicImpact"],
            "estimatedValueUnlocked": detail["estimatedValueUnlocked"],
            "valueAtRisk": detail["valueAtRisk"],
            "timeSavedEstimate": detail["timeSavedEstimate"],
            "strategicValueNarrative": detail["strategicValueNarrative"],
            "confidenceScore": detail["confidenceScore"],
            "confidenceReason": detail["confidenceReason"],
            "uncertainFields": detail["uncertainFields"],
            "missingRequirements": detail["missingRequirements"],
            "topPickRationale": detail["topPickRationale"],
            "requiredDocuments": required_documents,
            "checklist": checklist,
            "competitionInfo": competition_info,
            "aiExplanation": {
                "summary": detail["summary"],
                "reasoningBullets": detail["reasoningBullets"],
                "tradeoff": detail["tradeoff"],
                "whyNotNow": detail["whyNotNow"],
                "nextStep": detail["nextStep"],
                "economicImpact": detail["economicImpact"],
                "confidenceScore": detail["confidenceScore"],
                "confidenceReason": detail["confidenceReason"],
                "uncertainFields": detail["uncertainFields"],
                "source": detail["source"],
            },
            "quickActions": [
                {"label": "Apply on Official Site", "href": evaluation["opportunityLink"]},
                {"label": "Save for Later", "saved": evaluation["saved"]},
            ],
        }

    def save_opportunity(self, opportunity_id: str, saved: bool | None) -> dict[str, Any]:
        opportunity_id = self._resolve_opportunity_id(opportunity_id)
        profile = self._load_profile()
        saved_ids = set(profile.savedOpportunityIds)
        if saved is None:
            if opportunity_id in saved_ids:
                saved_ids.remove(opportunity_id)
            else:
                saved_ids.add(opportunity_id)
        elif saved:
            saved_ids.add(opportunity_id)
        else:
            saved_ids.discard(opportunity_id)
        updated = profile.model_copy(update={"savedOpportunityIds": sorted(saved_ids)})
        self._save_profile(updated)
        return {"id": opportunity_id, "saved": opportunity_id in saved_ids}

    def get_pipeline(self) -> dict[str, Any]:
        profile, _, evaluations = self._evaluated_opportunities()
        evaluations = self._enhance_visible_items(profile, evaluations, limit=3)
        summary = self._build_pipeline_summary(evaluations)
        grouped = {
            stage: [item for item in evaluations if item["pipelineStage"] == stage]
            for stage in ["apply-now", "prepare-soon", "track-later", "skip"]
        }
        at_risk = [item for item in evaluations if item["daysUntilDeadline"] is not None and item["daysUntilDeadline"] <= 30]
        return {
            "summary": summary,
            "expiringValue": summary["expiringValue"],
            "atRisk": at_risk,
            "stages": grouped,
        }

    def move_pipeline_stage(self, opportunity_id: str, stage: str) -> dict[str, Any] | None:
        canonical_id = self._resolve_opportunity_id(opportunity_id)
        if stage not in {"apply-now", "prepare-soon", "track-later", "skip"}:
            return None
        profile, _, evaluations = self._evaluated_opportunities()
        evaluation = next((item for item in evaluations if item["id"] == canonical_id), None)
        if evaluation is None:
            return None
        overrides = self._load_pipeline_overrides()
        overrides[canonical_id] = stage
        self._save_pipeline_overrides(overrides)
        evaluation["pipelineStage"] = stage
        evaluation["recommendedAction"] = stage
        evaluation["nextStep"] = self._stage_next_step(stage)
        return evaluation

    def get_readiness(self) -> dict[str, Any]:
        profile, documents, evaluations = self._evaluated_opportunities()
        overall, modules, blockers = self._readiness_modules(profile, documents, evaluations)
        behavior_signals = self._behavior_signals(profile, evaluations)
        priority_ids = set(profile.savedOpportunityIds + [item.opportunityId for item in self._load_applications()])
        prioritized_targets = sorted(
            evaluations,
            key=lambda item: (
                0 if item["id"] in priority_ids else 1,
                {"apply-now": 0, "prepare-soon": 1, "track-later": 2, "skip": 3}[item["pipelineStage"]],
                -item["priorityScore"],
            ),
        )
        ai = self.glm.readiness_insights(
            self._profile_summary(profile),
            modules,
            prioritized_targets[:4],
            behavior_signals=behavior_signals,
        )
        target_lookup = {item["title"]: item for item in prioritized_targets[:4]}
        enriched_blockers = []
        for blocker in blockers:
            matched = target_lookup.get(blocker["name"])
            unlock_value = int((matched or {}).get("estimatedValueUnlocked") or (matched or {}).get("estimatedValueRaw") or 0)
            enriched_blockers.append(
                {
                    **blocker,
                    "unlockImpact": (
                        f"Fixing this blocker could improve access to about RM{unlock_value:,.0f} in current opportunity value."
                        if unlock_value
                        else "Fixing this blocker should improve shortlist conversion odds."
                    ),
                }
            )
        ai_checklist = []
        for item in ai["checklist"]:
            ai_checklist.append(
                {
                    **item,
                    "unlockImpact": (
                        "Likely to improve the best saved or in-progress opportunities first."
                        if behavior_signals["savedOpportunityIds"] or behavior_signals["applicationOpportunityIds"]
                        else "Likely to improve shortlist readiness across multiple opportunities."
                    ),
                }
            )
        return {
            "overallReadiness": overall,
            "label": "Excellent" if overall >= 85 else "Good" if overall >= 70 else "Needs Work",
            "modules": modules,
            "blockers": enriched_blockers,
            "aiChecklist": ai_checklist,
            "tip": ai["tip"],
            "blockerNarrative": ai["blockerNarrative"],
            "aiExplanation": {
                "summary": ai["summary"],
                "reasoningBullets": ai["reasoningBullets"],
                "tradeoff": ai["tradeoff"],
                "whyNotNow": ai["whyNotNow"],
                "nextStep": ai["nextStep"],
                "economicImpact": ai["economicImpact"],
                "confidenceScore": ai["confidenceScore"],
                "confidenceReason": ai["confidenceReason"],
                "uncertainFields": ai["uncertainFields"],
                "source": ai["source"],
            },
            "nextMilestone": {
                "target": 80 if overall < 80 else 90,
                "current": overall,
                "message": "Reach the next readiness milestone to unlock stronger shortlist odds.",
            },
        }

    def get_planner(self) -> dict[str, Any]:
        profile, _, evaluations = self._evaluated_opportunities()
        tasks = []
        for task in self._load_planner():
            payload = task.model_dump(mode="json")
            payload["done"] = payload["completed"]
            tasks.append(payload)
        categories, focus_score, total_hours = self._planner_snapshot(tasks)
        ai = self.glm.planner_strategy(
            self._profile_summary(profile),
            tasks,
            evaluations[:4],
        )
        return {
            "weekLabel": "Current Week",
            "tasks": tasks,
            "categories": categories,
            "totalEstimatedTimeHours": total_hours,
            "focusScore": focus_score,
            "rationale": ai["rationale"],
            "optimization": ai["optimization"],
            "focusTip": ai["focusTip"],
            "aiExplanation": {
                "summary": ai["summary"],
                "reasoningBullets": ai["reasoningBullets"],
                "tradeoff": ai["tradeoff"],
                "whyNotNow": ai["whyNotNow"],
                "nextStep": ai["nextStep"],
                "economicImpact": ai["economicImpact"],
                "confidenceScore": ai["confidenceScore"],
                "confidenceReason": ai["confidenceReason"],
                "uncertainFields": ai["uncertainFields"],
                "source": ai["source"],
            },
        }

    def toggle_planner_task(self, task_id: str) -> dict[str, Any] | None:
        tasks = self._load_planner()
        updated_tasks = []
        changed = None
        for task in tasks:
            if task.id == task_id:
                toggled = task.model_copy(update={"completed": not task.completed})
                updated_tasks.append(toggled)
                changed = toggled
            else:
                updated_tasks.append(task)
        if changed is None:
            return None
        self._save_planner(updated_tasks)
        payload = changed.model_dump(mode="json")
        payload["done"] = payload["completed"]
        return payload

    def create_planner_task(self, payload: dict[str, Any]) -> dict[str, Any]:
        tasks = self._load_planner()
        duration_minutes = payload.get("durationMinutes")
        if duration_minutes is None:
            duration_text = payload.get("duration", "30min").lower()
            digits = "".join(character for character in duration_text if character.isdigit())
            duration_minutes = int(digits or 30)
            if "hr" in duration_text and duration_minutes <= 12:
                duration_minutes *= 60
        created = PlannerTaskState(
            id=f"task-{uuid4().hex[:8]}",
            title=payload["title"],
            subtitle=payload.get("subtitle") or "",
            dueLabel=payload.get("dueLabel") or "Today",
            dueDate=payload.get("dueDate"),
            time=payload.get("time"),
            duration=payload.get("duration") or "30min",
            durationMinutes=duration_minutes,
            completed=False,
            opportunityId=self._resolve_opportunity_id(payload["opportunityId"])
            if payload.get("opportunityId")
            else None,
            type=payload.get("type") or "apply-now",
        )
        tasks.append(created)
        self._save_planner(tasks)
        result = created.model_dump(mode="json")
        result["done"] = result["completed"]
        return result

    def optimize_planner(self) -> dict[str, Any]:
        planner = self.get_planner()
        reordered = sorted(
            planner["tasks"],
            key=lambda task: (
                {"apply-now": 0, "prepare-soon": 1, "track-later": 2, "skip": 3, "break": 4}[task["type"]],
                task["completed"],
            ),
        )
        planner["optimizedTasks"] = reordered
        return planner

    def get_insights(self) -> dict[str, Any]:
        profile, documents, evaluations = self._evaluated_opportunities()
        overall, modules, _ = self._readiness_modules(profile, documents, evaluations)
        total_value = int(sum(item["estimatedValueRaw"] for item in evaluations))
        value_at_risk = int(
            sum(
                item["estimatedValueRaw"]
                for item in evaluations
                if item["daysUntilDeadline"] is not None and item["daysUntilDeadline"] <= 30
            )
        )
        high_priority = len([item for item in evaluations if item["pipelineStage"] in {"apply-now", "prepare-soon"}])
        time_saved = round(max(6.0, len(evaluations) * 4.4), 1)
        match_to_goals = int(sum(item["fitScore"] for item in evaluations[:6]) / max(len(evaluations[:6]), 1))
        pipeline_value = int(sum(item["estimatedValueRaw"] for item in evaluations if item["pipelineStage"] != "skip"))
        metrics = [
            {"id": "total-value", "title": "Total Accessible Opportunity Value", "value": total_value, "change": 28},
            {"id": "value-at-risk", "title": "Value at Risk (Expiring Soon)", "value": value_at_risk, "change": 12, "warning": True},
            {"id": "high-priority", "title": "High-Priority Opportunities Identified", "value": high_priority, "change": 24},
            {"id": "time-saved", "title": "Time Saved in Manual Searching", "value": time_saved, "change": 31},
            {"id": "goal-match", "title": "Match to Student Goals %", "value": match_to_goals, "change": 9},
        ]

        total_category_value = max(total_value, 1)
        category_accumulator: dict[str, int] = {}
        for item in evaluations:
            category_accumulator[item["category"]] = category_accumulator.get(item["category"], 0) + int(item["estimatedValueRaw"])
        categories = [
            {
                "label": category,
                "value": value,
                "percent": int((value / total_category_value) * 100),
            }
            for category, value in sorted(category_accumulator.items(), key=lambda entry: entry[1], reverse=True)
        ]

        urgency = {
            "0-7 days": 0,
            "8-30 days": 0,
            "31-60 days": 0,
            "60+ days": 0,
        }
        for item in evaluations:
            days_left = item["daysUntilDeadline"]
            if days_left is None or days_left > 60:
                urgency["60+ days"] += 1
            elif days_left <= 7:
                urgency["0-7 days"] += 1
            elif days_left <= 30:
                urgency["8-30 days"] += 1
            else:
                urgency["31-60 days"] += 1

        bottlenecks = [
            {
                "title": module["title"],
                "match": module["completion"],
            }
            for module in sorted(modules, key=lambda item: item["completion"])[:4]
        ]
        growth_points = []
        for index in range(1, 8):
            growth_points.append(
                {
                    "month": f"M{index}",
                    "value": int((pipeline_value / 7) * index),
                }
            )

        ai = self.glm.insights_commentary(
            self._profile_summary(profile),
            {
                "metrics": metrics,
                "pipelineValue": pipeline_value,
                "valueAtRisk": value_at_risk,
                "categories": categories,
                "urgency": urgency,
                "overallReadiness": overall,
            },
        )
        return {
            "metrics": metrics,
            "missedValueTracker": {
                "pipelineValue": pipeline_value,
                "expiringSoon": value_at_risk,
            },
            "categoriesByValue": categories,
            "urgencyDistribution": urgency,
            "readinessBottlenecks": bottlenecks,
            "pipelineGrowth": growth_points,
            "economicImpactSummary": [
                {"label": "Potential Funding Impact", "value": total_value, "sub": "Total accessible value"},
                {"label": "Time Efficiency Gain", "value": time_saved, "sub": "Estimated manual-search time saved"},
                {"label": "Readiness Score", "value": overall, "sub": "How ready the current profile is"},
            ],
            "aiInsights": ai["cards"],
            "strategicShift": ai["strategy"],
            "economicImpactNarrative": ai["economicImpactNarrative"],
            "aiExplanation": {
                "summary": ai["summary"],
                "reasoningBullets": ai["reasoningBullets"],
                "tradeoff": ai["tradeoff"],
                "whyNotNow": ai["whyNotNow"],
                "nextStep": ai["nextStep"],
                "economicImpact": ai["economicImpact"],
                "confidenceScore": ai["confidenceScore"],
                "confidenceReason": ai["confidenceReason"],
                "uncertainFields": ai["uncertainFields"],
                "source": ai["source"],
            },
        }

    def get_advisor_bootstrap(self) -> dict[str, Any]:
        profile, _, evaluations = self._evaluated_opportunities()
        urgent_items = [
            {
                "title": item["title"],
                "note": (
                    "Deadline passed - use as a learning benchmark."
                    if item["daysUntilDeadline"] is not None and item["daysUntilDeadline"] <= 0
                    else f"Application due in {item['daysUntilDeadline']} days"
                ),
            }
            for item in evaluations
            if item["daysUntilDeadline"] is not None
        ]
        urgent_items = sorted(
            urgent_items,
            key=lambda item: int("".join(character for character in item["note"] if character.isdigit()) or 999),
        )[:5]

        return {
            "quickPrompts": [
                "Which opportunities should I prioritize?",
                "Show me high ROI opportunities",
                "What fits my career goals best?",
                "What scholarships am I eligible for?",
                "Help me plan my next 7 days",
            ],
            "goals": [goal.model_dump(mode="json") for goal in profile.goalsProgress],
            "urgent": urgent_items,
            "history": [message.model_dump(mode="json") for message in self._load_advisor_history()],
        }

    def advisor_chat(self, message: str, history: list[dict[str, Any]]) -> dict[str, Any]:
        profile, documents, evaluations = self._evaluated_opportunities()
        overall, modules, blockers = self._readiness_modules(profile, documents, evaluations)
        planner_tasks = [task.model_dump(mode="json") for task in self._load_planner()]
        planner_categories, focus_score, total_hours = self._planner_snapshot(planner_tasks)
        behavior_signals = self._behavior_signals(profile, evaluations)
        response = self.glm.advisor_reply(
            self._profile_summary(profile),
            message,
            history,
            {
                "topOpportunities": [
                    {
                        "id": item["id"],
                        "title": item["title"],
                        "category": item["category"],
                        "fitScore": item["fitScore"],
                        "roiScore": item["roiScore"],
                        "priorityScore": item["priorityScore"],
                        "recommendedAction": item.get("recommendedAction", item["pipelineStage"]),
                        "daysUntilDeadline": item["daysUntilDeadline"],
                        "deadline": item["deadline"],
                        "estimatedValue": item["estimatedValue"],
                        "missingRequirements": item["missingRequirements"],
                        "nextStep": item["nextStep"],
                    }
                    for item in evaluations[:8]
                ],
                "scholarshipOpportunities": [
                    {
                        "id": item["id"],
                        "title": item["title"],
                        "category": item["category"],
                        "fitScore": item["fitScore"],
                        "roiScore": item["roiScore"],
                        "priorityScore": item["priorityScore"],
                        "recommendedAction": item.get("recommendedAction", item["pipelineStage"]),
                        "daysUntilDeadline": item["daysUntilDeadline"],
                        "deadline": item["deadline"],
                        "estimatedValue": item["estimatedValue"],
                        "missingRequirements": item["missingRequirements"],
                        "nextStep": item["nextStep"],
                    }
                    for item in evaluations
                    if item["category"] == "Scholarship"
                ][:5],
                "readiness": {
                    "overall": overall,
                    "modules": modules[:6],
                    "blockers": blockers[:3],
                },
                "planner": {
                    "tasks": planner_tasks[:6],
                    "categories": planner_categories,
                    "focusScore": focus_score,
                    "totalEstimatedTimeHours": total_hours,
                    "focusTip": "Protect your highest-focus window for apply-now tasks before lower-ROI prep work.",
                },
                "behaviorSignals": behavior_signals,
            },
        )

        existing = self._load_advisor_history()
        next_id = max((item.id for item in existing), default=0) + 1
        now_label = datetime.now().strftime("%I:%M %p").lstrip("0")
        existing.extend(
            [
                AdvisorMessageState(id=next_id, role="user", content=message, time=now_label),
                AdvisorMessageState(
                    id=next_id + 1,
                    role="assistant",
                    content=response["response"],
                    time=now_label,
                ),
            ]
        )
        self._save_advisor_history(existing[-20:])
        return response

    def get_applications(self) -> dict[str, Any]:
        applications = []
        for item in self._load_applications():
            payload = item.model_dump(mode="json")
            payload["detailOpportunityId"] = self._resolve_opportunity_id(item.opportunityId)
            applications.append(payload)
        stats = {
            "totalApplications": len(applications),
            "inProgress": len([item for item in applications if item["status"] == "in-progress"]),
            "underReview": len([item for item in applications if item["status"] == "under-review"]),
            "accepted": len([item for item in applications if item["status"] == "accepted"]),
        }
        return {"stats": stats, "items": applications}

    def create_application(self, opportunity_id: str) -> dict[str, Any] | None:
        opportunity_id = self._resolve_opportunity_id(opportunity_id)
        opportunity = self.get_opportunity_detail(opportunity_id)
        if opportunity is None:
            return None

        applications = self._load_applications()
        existing = next((item for item in applications if item.opportunityId == opportunity_id), None)
        if existing:
            return existing.model_dump(mode="json")

        created = ApplicationState(
            id=f"app-{uuid4().hex[:8]}",
            opportunityId=opportunity_id,
            title=opportunity["title"],
            company=opportunity["company"],
            status="in-progress",
            submittedDate="Not submitted",
            deadline=opportunity["deadline"],
            stage="Preparing Application",
            progress=35,
        )
        applications.append(created)
        self._save_applications(applications)
        return created.model_dump(mode="json")

    def update_application(self, application_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        applications = self._load_applications()
        updated_items = []
        changed = None
        for item in applications:
            if item.id == application_id:
                changed = item.model_copy(update={key: value for key, value in payload.items() if value is not None})
                updated_items.append(changed)
            else:
                updated_items.append(item)
        if changed is None:
            return None
        self._save_applications(updated_items)
        return changed.model_dump(mode="json")

    def get_calendar(self) -> dict[str, Any]:
        _, _, evaluations = self._evaluated_opportunities()
        applications = self._load_applications()
        planner = self._load_planner()

        event_seed: list[tuple[date, dict[str, Any]]] = []
        for item in evaluations:
            if item["deadlineIso"]:
                parsed = self.scoring._parse_deadline(item["deadlineIso"])
                if parsed:
                    event_seed.append(
                        (
                            parsed.date(),
                            {
                                "label": item["company"],
                                "type": "Application Deadline",
                                "title": item["title"],
                                "color": "bg-red-100 text-red-700" if item["urgencyScore"] >= 80 else "bg-blue-100 text-blue-700",
                            },
                        )
                    )
        for application in applications:
            if application.interviewDate:
                parsed = self.scoring._parse_deadline(application.interviewDate)
                if parsed:
                    event_seed.append(
                        (
                            parsed.date(),
                            {
                                "label": "Interview",
                                "type": "Interview",
                                "title": application.title,
                                "color": "bg-purple-100 text-purple-700",
                            },
                        )
                    )
        for task in planner:
            if task.dueDate:
                parsed = self.scoring._parse_deadline(task.dueDate)
                if parsed:
                    event_seed.append(
                        (
                            parsed.date(),
                            {
                                "label": task.title,
                                "type": "Planner Task",
                                "title": task.subtitle or task.title,
                                "color": "bg-green-100 text-green-700",
                            },
                        )
                    )

        base_date = min((day for day, _ in event_seed), default=date.today())
        month_label = base_date.strftime("%B %Y")
        month_days = calendar.Calendar(firstweekday=6).monthdatescalendar(base_date.year, base_date.month)
        events_by_day: dict[date, list[dict[str, Any]]] = {}
        for event_date, payload in event_seed:
            events_by_day.setdefault(event_date, []).append(payload)

        grid = []
        for week in month_days:
            for day in week:
                grid.append(
                    {
                        "date": day.day,
                        "iso": day.isoformat(),
                        "isCurrentMonth": day.month == base_date.month,
                        "isToday": day == base_date,
                        "events": events_by_day.get(day, []),
                    }
                )
        upcoming = [
            {
                "date": day.strftime("%d %b %Y"),
                "title": payload["title"],
                "type": payload["type"],
                "color": payload["color"],
            }
            for day, payload in sorted(event_seed, key=lambda item: item[0])[:8]
        ]
        return {
            "monthLabel": month_label,
            "dayHeaders": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            "grid": grid,
            "upcoming": upcoming,
        }

    def get_documents(self) -> dict[str, Any]:
        documents = [item.model_dump(mode="json") for item in self._load_documents()]
        stats = {
            "totalDocuments": len(documents),
            "ready": len([item for item in documents if item["status"] == "ready"]),
            "needsUpdate": len([item for item in documents if item["status"] == "needs-update"]),
            "missing": len([item for item in documents if item["status"] == "missing"]),
        }
        return {"stats": stats, "items": documents}

    def create_document(self, payload: dict[str, Any]) -> dict[str, Any]:
        documents = self._load_documents()
        document = DocumentState(
            id=f"doc-{uuid4().hex[:8]}",
            title=payload["title"],
            category=payload["category"],
            size=payload.get("size") or "0 KB",
            uploadDate=payload.get("uploadDate") or date.today().strftime("%d %b %Y"),
            status=payload.get("status") or "ready",
            usedIn=0,
            path=payload.get("path"),
        )
        documents.append(document)
        self._save_documents(documents)
        return document.model_dump(mode="json")

    def update_document(self, document_id: str, payload: dict[str, Any]) -> dict[str, Any] | None:
        documents = self._load_documents()
        changed = None
        updated_documents = []
        for item in documents:
            if item.id == document_id:
                changed = item.model_copy(update={key: value for key, value in payload.items() if value is not None})
                updated_documents.append(changed)
            else:
                updated_documents.append(item)
        if changed is None:
            return None
        self._save_documents(updated_documents)
        return changed.model_dump(mode="json")

    def delete_document(self, document_id: str) -> bool:
        documents = self._load_documents()
        remaining = [item for item in documents if item.id != document_id]
        if len(remaining) == len(documents):
            return False
        self._save_documents(remaining)
        return True

    def get_network(self) -> dict[str, Any]:
        payload = self._load_network()
        connections = []
        for item in payload.get("connections", []):
            enriched = dict(item)
            enriched.setdefault("messaging", False)
            enriched.setdefault("message", "")
            connections.append(enriched)
        suggested_connections = []
        for item in payload.get("suggestedConnections", []):
            enriched = dict(item)
            enriched.setdefault("connected", False)
            suggested_connections.append(enriched)
        return {
            "stats": {
                "totalConnections": len(connections) + len([item for item in suggested_connections if item.get("connected")]),
                "mentors": len([item for item in connections if item["type"] == "Mentor"]),
                "alumni": len([item for item in connections if item["type"] == "Alumni"]),
                "activeChats": len([item for item in connections if item.get("messaging")]),
            },
            "connections": connections,
            "suggestedConnections": suggested_connections,
        }

    def connect_suggested_connection(self, connection_id: str) -> dict[str, Any] | None:
        payload = self._load_network()
        changed = None
        updated = []
        for item in payload.get("suggestedConnections", []):
            current = dict(item)
            if current.get("id") == connection_id:
                current["connected"] = True
                changed = current
            updated.append(current)
        if changed is None:
            return None
        payload["suggestedConnections"] = updated
        self._save_network(payload)
        return changed

    def message_connection(self, connection_id: str, message: str) -> dict[str, Any] | None:
        payload = self._load_network()
        changed = None
        updated = []
        for item in payload.get("connections", []):
            current = dict(item)
            if current.get("id") == connection_id:
                current["messaging"] = False
                current["message"] = message
                changed = current
            updated.append(current)
        if changed is None:
            return None
        payload["connections"] = updated
        self._save_network(payload)
        return changed

    def get_resources(self, search: str | None = None) -> dict[str, Any]:
        payload = self._load_resources()
        resources = [item.model_dump(mode="json") for item in payload.resources]
        if search:
            token = search.lower()
            resources = [
                item
                for item in resources
                if token in item["title"].lower() or token in item["description"].lower()
            ]
        return {
            "resources": resources,
            "webinars": [item.model_dump(mode="json") for item in payload.webinars],
            "categories": ["All Resources", "Guides", "Templates", "Videos", "Webinars"],
        }

    def search(self, query: str | None = None) -> dict[str, Any]:
        token = (query or "").strip().lower()
        if not token:
            return {
                "query": "",
                "totalCount": 0,
                "results": [],
            }

        _, _, evaluations = self._evaluated_opportunities()
        opportunity_results = []
        for item in evaluations:
            haystack = " ".join(
                [
                    item["title"],
                    item["company"],
                    item["category"],
                    item.get("recommendation", ""),
                ]
            ).lower()
            if token in haystack:
                opportunity_results.append(
                    {
                        "id": item["id"],
                        "type": "opportunity",
                        "title": item["title"],
                        "description": f"{item['company']}. {item.get('recommendation', '')}".strip(),
                        "link": f"/opportunities/{item['id']}",
                        "fitScore": item["fitScore"],
                    }
                )
        opportunity_results = sorted(
            opportunity_results,
            key=lambda item: item.get("fitScore", 0),
            reverse=True,
        )[:6]

        resource_payload = self._load_resources()
        resource_results = []
        for item in resource_payload.resources:
            haystack = f"{item.title} {item.description}".lower()
            if token in haystack:
                resource_results.append(
                    {
                        "id": item.id,
                        "type": "resource",
                        "title": item.title,
                        "description": item.description,
                        "link": "/resource-hub",
                    }
                )

        network_payload = self._load_network()
        network_results = []
        for group_name in ("connections", "suggestedConnections"):
            for item in network_payload.get(group_name, []):
                haystack = " ".join(
                    [
                        item.get("name", ""),
                        item.get("role", ""),
                        item.get("company", ""),
                        " ".join(item.get("expertise", [])),
                    ]
                ).lower()
                if token in haystack:
                    mutual = item.get("mutual", 0)
                    network_results.append(
                        {
                            "id": item["id"],
                            "type": "network",
                            "title": item["name"],
                            "description": (
                                f"{item.get('role', 'Connection')} at {item.get('company', 'Unknown company')}. "
                                f"{mutual} mutual connections."
                            ),
                            "link": "/network",
                        }
                    )

        results = opportunity_results + resource_results[:4] + network_results[:4]
        return {
            "query": query or "",
            "totalCount": len(results),
            "results": results,
        }

    def _subscription_payload(self) -> dict[str, Any]:
        return {
            "currentPlan": "Pro Scholar Plan",
            "validUntil": "May 25, 2026",
            "priceMonthly": 19.90,
            "currency": "RM",
            "billingLabel": "RM 19.90/mo",
            "benefits": [
                "Unlimited AI Advisor queries",
                "Priority opportunity matching",
                "Custom application templates",
                "Document analysis & optimization",
                "Early access to scholarship news",
                "Advanced analytics dashboard",
            ],
            "recentTransactions": [
                {"date": "Apr 25, 2026", "invoiceId": "#INV-2026-004", "amount": "RM 19.90", "status": "Paid"},
                {"date": "Mar 25, 2026", "invoiceId": "#INV-2026-003", "amount": "RM 19.90", "status": "Paid"},
                {"date": "Feb 25, 2026", "invoiceId": "#INV-2026-002", "amount": "RM 19.90", "status": "Paid"},
            ],
        }

    def _support_payload(self) -> dict[str, Any]:
        return {
            "supportEmail": "support@byte-me.ai",
            "helpCenterLabel": "Visit Help Center",
            "communityLabel": "Join Discord",
            "faq": [
                "How do I cancel my subscription?",
                "Can I export my application history?",
                "How does the AI Advisor match me to opportunities?",
                "Is my data safe with Byte Me?",
            ],
        }

    def get_settings(self) -> dict[str, Any]:
        profile = self._load_profile()
        preferences = [item.model_dump(mode="json") for item in self._load_preferences()]
        detail = self._load_settings_detail().model_dump(mode="json")
        return {
            "account": {
                "fullName": profile.name,
                "name": profile.name,
                "firstName": profile.firstName,
                "email": profile.email,
                "phone": profile.phone,
                "university": profile.university,
                "avatar": profile.avatar,
            },
            "preferences": preferences,
            "notifications": preferences,
            "aiPreferences": detail["aiPreferences"],
            "region": detail["region"],
            "privacy": detail["privacy"],
            "security": detail["security"],
            "subscription": self._subscription_payload(),
            "support": self._support_payload(),
            "dataControls": {
                "exportAvailable": True,
                "clearHistoryAvailable": True,
                "deactivateAvailable": True,
                "deleteAvailable": True,
            },
        }

    def update_account(self, payload: dict[str, Any]) -> dict[str, Any]:
        if payload.get("fullName") and not payload.get("name"):
            payload = {**payload, "name": payload["fullName"]}
        profile = self._load_profile()
        updated = profile.model_copy(update={key: value for key, value in payload.items() if value is not None})
        if updated.name and (not updated.firstName or payload.get("name")):
            updated = updated.model_copy(update={"firstName": updated.name.split()[0]})
        self._save_profile(updated)
        return self.get_settings()

    def export_insights_report(self) -> dict[str, Any]:
        insights = self.get_insights()
        export_path = self.store.statePath("insights_report.json")
        self.store.save_json(export_path, insights)
        return {
            "message": "Insights report generated successfully.",
            "generatedAt": datetime.now().astimezone().isoformat(),
            "exportPath": str(Path(export_path).resolve()),
            "sections": {
                "metrics": len(insights["metrics"]),
                "categories": len(insights["categoriesByValue"]),
                "aiInsights": len(insights["aiInsights"]),
            },
        }

    def update_preferences(self, payload: list[dict[str, Any]]) -> dict[str, Any]:
        current = {item.title: item for item in self._load_preferences()}
        updated = []
        for item in payload:
            title = item["title"]
            if title in current:
                updated.append(current[title].model_copy(update={"enabled": item["enabled"]}))
        updated_titles = {item.title for item in updated}
        for title, preference in current.items():
            if title not in updated_titles:
                updated.append(preference)
        self._save_preferences(updated)
        return self.get_settings()

    def update_ai_preferences(self, payload: dict[str, Any]) -> dict[str, Any]:
        detail = self._load_settings_detail()
        updated = detail.aiPreferences.model_copy(update={key: value for key, value in payload.items() if value is not None})
        self._save_settings_detail(detail.model_copy(update={"aiPreferences": updated}))
        return self.get_settings()

    def update_region_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        detail = self._load_settings_detail()
        updated = detail.region.model_copy(update={key: value for key, value in payload.items() if value is not None})
        self._save_settings_detail(detail.model_copy(update={"region": updated}))
        return self.get_settings()

    def update_privacy_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        detail = self._load_settings_detail()
        updated = detail.privacy.model_copy(update={key: value for key, value in payload.items() if value is not None})
        self._save_settings_detail(detail.model_copy(update={"privacy": updated}))
        return self.get_settings()

    def export_data(self) -> dict[str, Any]:
        profile = self._load_profile().model_dump(mode="json")
        settings = self.get_settings()
        export_payload = {
            "profile": profile,
            "applications": [item.model_dump(mode="json") for item in self._load_applications()],
            "documents": [item.model_dump(mode="json") for item in self._load_documents()],
            "planner": [item.model_dump(mode="json") for item in self._load_planner()],
            "settings": settings,
        }
        export_path = self.store.statePath("last_export.json")
        self.store.save_json(export_path, export_payload)
        return {
            "message": "Export generated successfully.",
            "generatedAt": datetime.now().astimezone().isoformat(),
            "exportPath": str(Path(export_path).resolve()),
            "sections": {
                "profile": True,
                "applications": len(export_payload["applications"]),
                "documents": len(export_payload["documents"]),
                "planner": len(export_payload["planner"]),
            },
        }

    def deactivate_account(self) -> dict[str, Any]:
        return {
            "success": True,
            "message": "Account deactivation recorded in demo mode.",
        }

    def delete_account(self) -> dict[str, Any]:
        return {
            "success": True,
            "message": "Account deletion request recorded in demo mode.",
        }

    def clear_history(self) -> dict[str, Any]:
        self._save_advisor_history([])
        self.store.save_json(self.store.statePath("search_history.json"), [])
        return {
            "success": True,
            "message": "Search and AI history cleared.",
        }

    def submit_feedback(self, message: str) -> dict[str, Any]:
        feedback_path = self.store.statePath("feedback_log.json")
        feedback = self.store.load_json(feedback_path, default=[])
        feedback.append(
            {
                "id": str(uuid4()),
                "message": message,
                "submittedAt": datetime.now().astimezone().isoformat(),
            }
        )
        self.store.save_json(feedback_path, feedback)
        return {
            "success": True,
            "message": "Feedback submitted successfully.",
        }
