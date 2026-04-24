from __future__ import annotations

from datetime import date, datetime
from typing import Any

from dateutil import parser as date_parser

from app.models import DocumentState, OpportunitySeed, ProfileState


class ScoringService:
    def _normalize(self, value: str) -> str:
        return value.strip().lower()

    def _parse_deadline(self, deadline: str | None) -> datetime | None:
        if not deadline:
            return None
        try:
            return date_parser.parse(deadline)
        except (ValueError, TypeError, OverflowError):
            return None

    def _days_until(self, deadline: str | None) -> int | None:
        parsed = self._parse_deadline(deadline)
        if parsed is None:
            return None
        return (parsed.date() - date.today()).days

    def format_deadline(self, deadline: str | None) -> str:
        parsed = self._parse_deadline(deadline)
        if parsed is None:
            return "TBA"
        return parsed.strftime("%d %b %Y")

    def opportunity_value_score(self, opportunity: OpportunitySeed) -> int:
        raw = opportunity.estimatedValueRaw or 0
        if raw >= 120000:
            return 100
        if raw >= 50000:
            return 92
        if raw >= 15000:
            return 78
        if raw >= 5000:
            return 66
        if raw >= 1000:
            return 52
        return 35 if opportunity.category in {"Certification", "Programme"} else 20

    def urgency_score(self, deadline: str | None) -> int:
        days_left = self._days_until(deadline)
        if days_left is None:
            return 25
        if days_left <= 0:
            return 100
        if days_left <= 3:
            return 96
        if days_left <= 7:
            return 88
        if days_left <= 14:
            return 78
        if days_left <= 30:
            return 68
        if days_left <= 60:
            return 50
        if days_left <= 120:
            return 32
        return 18

    def _goal_alignment_score(self, profile: ProfileState, opportunity: OpportunitySeed) -> int:
        goal = self._normalize(profile.goal)
        category = self._normalize(opportunity.category)
        title = self._normalize(opportunity.title)
        if "industry" in goal or "internship" in goal:
            if category in {"internship", "programme"}:
                return 100
        if "scholar" in goal or "postgraduate" in goal:
            if category == "scholarship":
                return 100
        if "research" in goal:
            if "research" in title:
                return 90
        if "competition" in goal:
            if category == "competition":
                return 90
        return 55

    def _discipline_match_score(
        self, profile: ProfileState, opportunity: OpportunitySeed
    ) -> tuple[int, bool]:
        course = self._normalize(profile.course)
        faculty = self._normalize(profile.faculty)
        interests = [self._normalize(item) for item in profile.interests]
        disciplines = [self._normalize(item) for item in opportunity.targetDisciplines]
        if any(item in {"all", "any"} for item in disciplines):
            return 84, True

        overlap = 0
        for discipline in disciplines:
            if discipline in course or course in discipline:
                overlap += 2
            if discipline in faculty or faculty in discipline:
                overlap += 1
            if any(discipline in interest or interest in discipline for interest in interests):
                overlap += 1

        if overlap >= 4:
            return 100, True
        if overlap >= 3:
            return 88, True
        if overlap >= 2:
            return 74, True
        if overlap >= 1:
            return 62, True
        return 30, False

    def _year_match_score(self, profile: ProfileState, opportunity: OpportunitySeed) -> tuple[int, bool]:
        if not opportunity.targetYear:
            return 70, True
        if 0 in opportunity.targetYear or profile.year in opportunity.targetYear:
            return 95, True
        closest = min(abs(profile.year - year) for year in opportunity.targetYear)
        if closest == 1:
            return 58, False
        return 24, False

    def _study_level_match_score(
        self, profile: ProfileState, opportunity: OpportunitySeed
    ) -> tuple[int, bool]:
        level = self._normalize(profile.studyLevel)
        opportunity_levels = [self._normalize(item) for item in opportunity.studyLevel]
        if not opportunity_levels or "any" in opportunity_levels:
            return 75, True
        if any(level in item or item in level for item in opportunity_levels):
            return 92, True
        if level == "undergraduate" and any(
            item in {"bachelor", "bachelor’s degree", "degree"} for item in opportunity_levels
        ):
            return 90, True
        return 30, False

    def _readiness_score(
        self,
        opportunity: OpportunitySeed,
        profile: ProfileState,
        documents: list[DocumentState],
    ) -> tuple[int, list[str]]:
        if not opportunity.requiredDocuments:
            return 78, []

        available_tokens = {
            self._normalize(asset.label)
            for asset in profile.assets
            if asset.completion >= 60 or asset.status.lower() in {"uploaded", "connected", "added"}
        }
        available_tokens.update(
            self._normalize(document.title) for document in documents if document.status == "ready"
        )
        available_tokens.update(
            self._normalize(document.category) for document in documents if document.status == "ready"
        )

        missing: list[str] = []
        matched = 0
        for requirement in opportunity.requiredDocuments:
            token = self._normalize(requirement)
            if any(token in candidate or candidate in token for candidate in available_tokens):
                matched += 1
            else:
                missing.append(requirement)

        readiness = int((matched / max(len(opportunity.requiredDocuments), 1)) * 100)
        return readiness, missing

    def evaluate(
        self,
        profile: ProfileState,
        opportunities: list[OpportunitySeed],
        documents: list[DocumentState],
    ) -> list[dict[str, Any]]:
        evaluations = [
            self.evaluate_opportunity(profile, opportunity, documents)
            for opportunity in opportunities
        ]
        evaluations.sort(key=lambda item: item["priorityScore"], reverse=True)
        if evaluations:
            evaluations[0]["topPick"] = True
        return evaluations

    def evaluate_opportunity(
        self,
        profile: ProfileState,
        opportunity: OpportunitySeed,
        documents: list[DocumentState],
    ) -> dict[str, Any]:
        discipline_score, discipline_match = self._discipline_match_score(profile, opportunity)
        year_score, year_match = self._year_match_score(profile, opportunity)
        study_score, level_match = self._study_level_match_score(profile, opportunity)
        goal_alignment = self._goal_alignment_score(profile, opportunity)
        value_score = self.opportunity_value_score(opportunity)
        urgency_score = self.urgency_score(opportunity.deadline)
        readiness_score, missing_requirements = self._readiness_score(
            opportunity, profile, documents
        )

        interest_overlap = 72
        profile_tokens = " ".join([profile.course, profile.faculty, *profile.interests, *profile.skills]).lower()
        if any(token.lower() in profile_tokens for token in opportunity.tags):
            interest_overlap = 88

        fit_score = int(
            min(
                100,
                (
                    discipline_score * 0.35
                    + year_score * 0.18
                    + study_score * 0.12
                    + goal_alignment * 0.2
                    + interest_overlap * 0.15
                ),
            )
        )

        effort_score = {"Low": 92, "Medium": 70, "High": 42}[opportunity.applicationEffort]
        roi_score = int(
            min(
                100,
                fit_score * 0.35
                + value_score * 0.30
                + effort_score * 0.15
                + opportunity.strategicValue * 0.20,
            )
        )
        priority_score = int(
            min(
                100,
                fit_score * 0.30
                + value_score * 0.20
                + urgency_score * 0.18
                + readiness_score * 0.16
                + opportunity.strategicValue * 0.16,
            )
        )

        eligibility_value = fit_score * 0.55 + readiness_score * 0.20 + (
            25 if discipline_match and year_match and level_match else 0
        )
        if eligibility_value >= 78:
            eligibility = "High"
        elif eligibility_value >= 55:
            eligibility = "Medium"
        else:
            eligibility = "Low"

        if fit_score >= 82 and urgency_score >= 70 and readiness_score >= 55:
            pipeline_stage = "apply-now"
        elif fit_score >= 68 and (readiness_score < 55 or opportunity.applicationEffort == "High"):
            pipeline_stage = "prepare-soon"
        elif fit_score >= 48:
            pipeline_stage = "track-later"
        else:
            pipeline_stage = "skip"

        next_step = "Review the official listing and prepare the required documents."
        if pipeline_stage == "apply-now":
            next_step = "Start the application this week and submit before the deadline window tightens."
        elif pipeline_stage == "prepare-soon":
            next_step = "Close the missing readiness gaps first, then begin the application."
        elif pipeline_stage == "track-later":
            next_step = "Save it, monitor the deadline, and revisit when your profile is stronger."
        elif pipeline_stage == "skip":
            next_step = "Do not spend time here yet unless your goals shift."

        recommendation = (
            f"Fit {fit_score}% with {opportunity.estimatedValueLabel.lower()} upside and "
            f"{opportunity.applicationEffort.lower()} effort."
        )

        return {
            "id": opportunity.id,
            "title": opportunity.title,
            "company": opportunity.company,
            "logo": opportunity.logo,
            "category": opportunity.category,
            "deadline": self.format_deadline(opportunity.deadline),
            "deadlineIso": opportunity.deadline,
            "daysUntilDeadline": self._days_until(opportunity.deadline),
            "estimatedValue": opportunity.estimatedValueLabel,
            "estimatedValueRaw": opportunity.estimatedValueRaw or 0,
            "fitScore": fit_score,
            "effort": opportunity.applicationEffort,
            "eligibility": eligibility,
            "roiScore": roi_score,
            "recommendation": recommendation,
            "pipelineStage": pipeline_stage,
            "verified": opportunity.verified and opportunity.sourceCredibility == "High",
            "tag": opportunity.tag,
            "topPick": opportunity.topPick,
            "location": opportunity.location,
            "type": opportunity.type,
            "priorityScore": priority_score,
            "urgencyScore": urgency_score,
            "readinessScore": readiness_score,
            "valueScore": value_score,
            "strategicValue": opportunity.strategicValue,
            "opportunityLink": opportunity.opportunityLink,
            "description": opportunity.description,
            "eligibilityText": opportunity.eligibility,
            "requiredDocuments": opportunity.requiredDocuments,
            "missingRequirements": missing_requirements,
            "nextStep": next_step,
            "risk": (
                "Missing required application assets."
                if missing_requirements
                else "No major blockers surfaced from the current profile."
            ),
            "tradeoff": (
                "Higher upside but also heavier application effort."
                if opportunity.applicationEffort == "High"
                else "Good balance of upside and time required."
            ),
            "fitLabel": self.score_label(fit_score),
            "urgencyLabel": self.score_label(urgency_score),
        }

    def score_label(self, score: int) -> str:
        if score >= 90:
            return "Excellent"
        if score >= 75:
            return "High"
        if score >= 55:
            return "Medium"
        return "Low"
