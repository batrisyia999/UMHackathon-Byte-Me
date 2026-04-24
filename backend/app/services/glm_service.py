from __future__ import annotations

import hashlib
import json
import time
from datetime import datetime
from typing import Any

import requests

from app.config import Settings


class GLMService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.cache: dict[str, Any] = {}

    @property
    def enabled(self) -> bool:
        return bool(self.settings.zAiApiKey)

    def _cache_key(self, payload: dict[str, Any]) -> str:
        blob = json.dumps(payload, sort_keys=True, ensure_ascii=True)
        return hashlib.sha256(blob.encode("utf-8")).hexdigest()

    def _request_json(
        self,
        system_prompt: str,
        user_payload: dict[str, Any],
        *,
        max_tokens: int = 1400,
        reasoning_effort: str = "medium",
    ) -> dict[str, Any] | None:
        if not self.enabled:
            return None

        request_payload = {
            "model": self.settings.zAiModel,
            "temperature": 0.2,
            "stream": False,
            "response_format": {"type": "json_object"},
            "reasoning_effort": reasoning_effort,
            "max_tokens": max_tokens,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_payload, ensure_ascii=True, indent=2)},
            ],
        }
        cache_key = self._cache_key(request_payload)
        if cache_key in self.cache:
            return self.cache[cache_key]

        parsed = self._post_with_retries(request_payload)
        self.cache[cache_key] = parsed
        return parsed

    def _post_with_retries(self, request_payload: dict[str, Any]) -> dict[str, Any]:
        last_error: Exception | None = None
        for attempt in range(2):
            try:
                return self._post_once(request_payload)
            except requests.HTTPError as error:
                last_error = error
                status = error.response.status_code if error.response is not None else None
                should_retry = status is None or status >= 500 or status == 429
                if not should_retry:
                    response_text = ""
                    if error.response is not None:
                        response_text = error.response.text.lower()
                    should_fallback_model = (
                        status in {400, 404}
                        and self.settings.zAiFallbackModel
                        and request_payload["model"] != self.settings.zAiFallbackModel
                        and ("model_not_found" in response_text or "does not exist" in response_text or status == 400)
                    )
                    if should_fallback_model:
                        fallback_payload = dict(request_payload)
                        fallback_payload["model"] = self.settings.zAiFallbackModel
                        return self._post_once(fallback_payload)
                    raise
            except (ValueError, KeyError, json.JSONDecodeError, TypeError) as error:
                last_error = error
                break
            except requests.RequestException as error:
                last_error = error
                if attempt == 1:
                    break
            time.sleep(0.8 * (attempt + 1))
        if last_error:
            raise last_error
        raise RuntimeError("Unknown ILMU API error")

    def _post_once(self, request_payload: dict[str, Any]) -> dict[str, Any]:
        response = requests.post(
            f"{self.settings.zAiBaseUrl}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.settings.zAiApiKey}",
                "Content-Type": "application/json",
            },
            json=request_payload,
            timeout=self.settings.zAiTimeoutSeconds,
        )
        response.raise_for_status()
        payload = response.json()
        content = payload["choices"][0]["message"].get("content", "")
        if content in (None, ""):
            raise ValueError(
                f"ILMU returned empty content with finish_reason={payload['choices'][0].get('finish_reason')}"
            )
        return self._safe_parse_json(content)

    def _safe_parse_json(self, content: str) -> dict[str, Any]:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            start = content.find("{")
            end = content.rfind("}")
            if start >= 0 and end > start:
                return json.loads(content[start : end + 1])
            raise

    def explain_candidates(
        self,
        profile: dict[str, Any],
        candidates: list[dict[str, Any]],
    ) -> dict[str, dict[str, Any]]:
        system_prompt = (
            "You are OpportunIQ's AI decision engine for university students. "
            "Local scoring has already identified candidate opportunities. "
            "Your job is to perform decision reasoning, explanation, trade-off analysis, "
            "readiness interpretation, and personalised action recommendation. "
            "Return JSON only."
        )
        user_payload = {
            "task": "Enhance the top candidate opportunities.",
            "profile": profile,
            "candidates": [
                {
                    "id": candidate["id"],
                    "title": candidate["title"],
                    "category": candidate["category"],
                    "deadline": candidate["deadline"],
                    "estimatedValue": candidate["estimatedValue"],
                    "fitScore": candidate["fitScore"],
                    "urgencyScore": candidate["urgencyScore"],
                    "readinessScore": candidate["readinessScore"],
                    "effort": candidate["effort"],
                    "pipelineStage": candidate["pipelineStage"],
                    "missingRequirements": candidate["missingRequirements"],
                }
                for candidate in candidates
            ],
            "outputSchema": {
                "results": [
                    {
                        "id": "string",
                        "recommendedAction": "apply-now | prepare-soon | track-later | skip",
                        "reasoningSummary": "string",
                        "tradeoff": "string",
                        "readinessGap": "string",
                        "risk": "string",
                        "nextStep": "string",
                        "fitLabel": "string",
                        "topPickRationale": "string",
                    }
                ]
            },
        }
        try:
            parsed = self._request_json(
                system_prompt,
                user_payload,
                max_tokens=1200,
                reasoning_effort="medium",
            )
        except Exception:
            return {
                candidate["id"]: {
                    "recommendedAction": candidate["pipelineStage"],
                    "reasoningSummary": candidate["recommendation"],
                    "tradeoff": candidate["tradeoff"],
                    "readinessGap": (
                        ", ".join(candidate["missingRequirements"])
                        if candidate["missingRequirements"]
                        else "No major readiness gaps surfaced from the current profile."
                    ),
                    "risk": candidate["risk"],
                    "nextStep": candidate["nextStep"],
                    "fitLabel": candidate["fitLabel"],
                    "topPickRationale": "Local fallback: this surfaced because it scored strongly on fit, value, urgency, and readiness.",
                }
                for candidate in candidates
            }

        results = {}
        for item in (parsed or {}).get("results", []):
            item_id = item.get("id")
            if item_id:
                results[item_id] = item
        return results

    def explain_opportunity_detail(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
    ) -> dict[str, Any]:
        system_prompt = (
            "You are OpportunIQ's AI detail analyst. "
            "Local scoring has already surfaced this opportunity as relevant. "
            "Provide clear reasoning bullets, missing requirements, and a personalised action recommendation. "
            "Return JSON only."
        )
        user_payload = {
            "task": "Explain a single student opportunity in decision-support language.",
            "profile": profile,
            "opportunity": {
                "id": opportunity["id"],
                "title": opportunity["title"],
                "category": opportunity["category"],
                "deadline": opportunity["deadline"],
                "estimatedValue": opportunity["estimatedValue"],
                "fitScore": opportunity["fitScore"],
                "urgencyScore": opportunity["urgencyScore"],
                "readinessScore": opportunity["readinessScore"],
                "effort": opportunity["effort"],
                "eligibility": opportunity["eligibility"],
                "requiredDocuments": opportunity["requiredDocuments"],
                "missingRequirements": opportunity["missingRequirements"],
                "pipelineStage": opportunity["pipelineStage"],
                "description": opportunity["description"],
            },
            "outputSchema": {
                "recommendedAction": "string",
                "summary": "string",
                "reasoningBullets": ["string"],
                "missingRequirements": ["string"],
                "topPickRationale": "string",
            },
        }
        try:
            parsed = self._request_json(
                system_prompt,
                user_payload,
                max_tokens=900,
                reasoning_effort="medium",
            )
        except Exception:
            parsed = None

        if parsed:
            return parsed

        fallback_bullets = [
            f"Strong local fit score of {opportunity['fitScore']}% based on course, year, goal, and interest overlap.",
            f"Urgency score of {opportunity['urgencyScore']} reflects the current deadline pressure.",
            f"Readiness score of {opportunity['readinessScore']} shows how prepared the current profile is.",
        ]
        if opportunity["missingRequirements"]:
            fallback_bullets.append(
                "Missing assets are reducing the likelihood of a clean application submission."
            )

        return {
            "recommendedAction": opportunity["pipelineStage"],
            "summary": opportunity["recommendation"],
            "reasoningBullets": fallback_bullets,
            "missingRequirements": opportunity["missingRequirements"],
            "topPickRationale": "Local fallback: this item stands out because it combines fit, value, urgency, and strategic upside.",
        }

    def readiness_insights(
        self,
        profile: dict[str, Any],
        modules: list[dict[str, Any]],
        opportunities: list[dict[str, Any]],
    ) -> dict[str, Any]:
        system_prompt = (
            "You are OpportunIQ's readiness coach. "
            "Interpret the student's readiness modules against the top candidate opportunities. "
            "Return a short checklist, one tip, and a blocker summary as JSON."
        )
        user_payload = {
            "task": "Summarise readiness gaps and provide practical improvement advice.",
            "profile": profile,
            "modules": [
                {
                    "title": module["title"],
                    "completion": module["completion"],
                    "impact": module["impact"],
                    "status": module["status"],
                }
                for module in modules
            ],
            "opportunities": [
                {
                    "title": opportunity["title"],
                    "category": opportunity["category"],
                    "fitScore": opportunity["fitScore"],
                    "missingRequirements": opportunity["missingRequirements"],
                }
                for opportunity in opportunities
            ],
            "outputSchema": {
                "tip": "string",
                "checklist": [{"label": "string", "impact": "High Impact | Medium Impact"}],
                "blockerNarrative": "string",
            },
        }
        try:
            parsed = self._request_json(
                system_prompt,
                user_payload,
                max_tokens=900,
                reasoning_effort="medium",
            )
        except Exception:
            parsed = None

        if parsed:
            return parsed

        incomplete = [module for module in modules if module["completion"] < 80]
        checklist = [
            {"label": f"Improve {module['title']}", "impact": "High Impact" if module["impact"] == "High" else "Medium Impact"}
            for module in incomplete[:5]
        ]
        return {
            "tip": "Local fallback: improving the top missing assets will unlock more shortlist-worthy opportunities.",
            "checklist": checklist,
            "blockerNarrative": "Readiness is currently constrained by missing assets and partially completed application materials.",
        }

    def planner_strategy(
        self,
        profile: dict[str, Any],
        tasks: list[dict[str, Any]],
        opportunities: list[dict[str, Any]],
    ) -> dict[str, Any]:
        system_prompt = (
            "You are OpportunIQ's weekly planner strategist. "
            "Local scoring has already identified the priority opportunities and tasks. "
            "Return JSON with rationale bullets, one optimization suggestion, and one focus tip."
        )
        user_payload = {
            "task": "Explain and optimize the current weekly plan.",
            "profile": profile,
            "tasks": [
                {
                    "title": task["title"],
                    "subtitle": task.get("subtitle"),
                    "type": task["type"],
                    "durationMinutes": task["durationMinutes"],
                    "completed": task["completed"],
                }
                for task in tasks
            ],
            "opportunities": [
                {
                    "title": opportunity["title"],
                    "recommendedAction": opportunity.get("recommendedAction", opportunity["pipelineStage"]),
                    "fitScore": opportunity["fitScore"],
                    "deadline": opportunity["deadline"],
                }
                for opportunity in opportunities
            ],
            "outputSchema": {
                "rationale": ["string"],
                "optimization": {"title": "string", "text": "string"},
                "focusTip": "string",
            },
        }
        try:
            parsed = self._request_json(
                system_prompt,
                user_payload,
                max_tokens=900,
                reasoning_effort="medium",
            )
        except Exception:
            parsed = None

        if parsed:
            return parsed

        return {
            "rationale": [
                "Local fallback: the plan front-loads the highest-value and most urgent opportunities.",
                "Local fallback: preparation tasks are sequenced before lower-ROI research work.",
                "Local fallback: the schedule preserves some time for long-term readiness building.",
            ],
            "optimization": {
                "title": "Reallocate one lower-value task",
                "text": "Move one lower-ROI preparation task later in the week to protect your highest-focus window.",
            },
            "focusTip": "Submit the highest-value application before the final deadline week to reduce avoidable risk.",
        }

    def insights_commentary(
        self,
        profile: dict[str, Any],
        metrics: dict[str, Any],
    ) -> dict[str, Any]:
        system_prompt = (
            "You are OpportunIQ's economic impact analyst. "
            "Interpret the current pipeline metrics and return three short insight cards plus a strategic shift recommendation as JSON."
        )
        user_payload = {
            "task": "Summarise economic impact and recommend one shift in focus.",
            "profile": profile,
            "metrics": metrics,
            "outputSchema": {
                "cards": [
                    {"label": "string", "color": "text-green-600", "text": "string"}
                ],
                "strategy": {
                    "currentFocus": "string",
                    "suggestedFocus": "string",
                    "impactText": "string",
                },
            },
        }
        try:
            parsed = self._request_json(
                system_prompt,
                user_payload,
                max_tokens=900,
                reasoning_effort="medium",
            )
        except Exception:
            parsed = None

        if parsed:
            return parsed

        return {
            "cards": [
                {
                    "label": "Strong progress",
                    "color": "text-green-600",
                    "text": "Local fallback: the pipeline shows real accessible value and a healthy set of near-term actions.",
                },
                {
                    "label": "Expiring value alert",
                    "color": "text-orange-600",
                    "text": "Local fallback: some value is at risk because a meaningful share of opportunities expire soon.",
                },
                {
                    "label": "Strategic balance",
                    "color": "text-blue-600",
                    "text": "Local fallback: balancing short-term wins with long-term profile-building will improve total capture.",
                },
            ],
            "strategy": {
                "currentFocus": "A large share of the current pipeline sits in one dominant opportunity category.",
                "suggestedFocus": "Shift some effort into high-fit internships and programmes with faster economic payoff.",
                "impactText": "This should improve near-term conversion while preserving long-term upside.",
            },
        }

    def advisor_reply(
        self,
        profile: dict[str, Any],
        history: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        system_prompt = (
            "You are OpportunIQ's AI advisor for university students. "
            "Local scoring has already identified candidate opportunities. "
            "You must perform decision reasoning, explanation, trade-off analysis, readiness interpretation, "
            "and personalised action recommendation grounded only in the provided context. "
            "Return JSON only."
        )
        user_payload = {
            "task": "Answer the student's question using the current profile, opportunity context, readiness, and planner context.",
            "profile": profile,
            "history": history[-6:],
            "context": context,
            "timestamp": datetime.utcnow().isoformat(),
            "outputSchema": {
                "response": "string",
                "citedOpportunityIds": ["string"],
                "recommendedActions": ["string"],
                "suggestedPrompts": ["string"],
            },
        }
        try:
            parsed = self._request_json(
                system_prompt,
                user_payload,
                max_tokens=1200,
                reasoning_effort="medium",
            )
        except Exception:
            parsed = None

        if parsed:
            return parsed

        top_ids = [item["id"] for item in context.get("topOpportunities", [])[:3]]
        return {
            "response": "Local fallback: focus first on the strongest near-term opportunities, close the biggest readiness gaps, and defer weaker-fit items until your profile improves.",
            "citedOpportunityIds": top_ids,
            "recommendedActions": [
                "Apply now to the highest-fit, high-urgency opportunity.",
                "Strengthen the missing documents blocking your next-best option.",
                "Track lower-fit items without spending core focus time on them yet.",
            ],
            "suggestedPrompts": [
                "Which one should I finish first this week?",
                "What is blocking my best scholarship option?",
                "How should I split my time over the next 7 days?",
            ],
        }
