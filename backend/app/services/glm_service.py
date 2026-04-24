from __future__ import annotations

import hashlib
import json
import time
from datetime import UTC, datetime
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

    def explain_featured_recommendation(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
    ) -> dict[str, Any]:
        system_prompt = (
            "You are OpportunIQ's home dashboard explainer. "
            "Local scoring has already identified the top recommendation. "
            "Your job is to explain clearly why this is the best current opportunity for this student, "
            "what trade-off the student should understand, and what action to take now. "
            "Return JSON only."
        )
        user_payload = {
            "task": "Explain the current top recommendation for the home dashboard.",
            "profile": profile,
            "opportunity": {
                "id": opportunity["id"],
                "title": opportunity["title"],
                "company": opportunity["company"],
                "category": opportunity["category"],
                "deadline": opportunity["deadline"],
                "estimatedValue": opportunity["estimatedValue"],
                "fitScore": opportunity["fitScore"],
                "roiScore": opportunity["roiScore"],
                "urgencyScore": opportunity["urgencyScore"],
                "readinessScore": opportunity["readinessScore"],
                "effort": opportunity["effort"],
                "pipelineStage": opportunity["pipelineStage"],
                "missingRequirements": opportunity["missingRequirements"],
                "nextStep": opportunity["nextStep"],
            },
            "outputSchema": {
                "recommendedAction": "apply-now | prepare-soon | track-later | skip",
                "summary": "string",
                "reasoningBullets": ["string"],
                "tradeoff": "string",
                "topPickRationale": "string",
                "nextStep": "string",
            },
        }
        try:
            parsed = self._request_json(
                system_prompt,
                user_payload,
                max_tokens=700,
                reasoning_effort="low",
            )
        except Exception:
            parsed = None

        if parsed:
            return {
                "recommendedAction": parsed.get("recommendedAction", opportunity["pipelineStage"]),
                "summary": parsed.get("summary", opportunity["recommendation"]),
                "reasoningBullets": parsed.get("reasoningBullets")
                or [
                    f"Strong fit score of {opportunity['fitScore']}% from the current student profile.",
                    f"This opportunity offers {opportunity['estimatedValue']} with a {opportunity['effort'].lower()} effort profile.",
                    f"Immediate next move: {opportunity['nextStep']}",
                ],
                "tradeoff": parsed.get("tradeoff", opportunity["tradeoff"]),
                "topPickRationale": parsed.get(
                    "topPickRationale",
                    "GLM selected this as the strongest current blend of fit, timing, and upside.",
                ),
                "nextStep": parsed.get("nextStep", opportunity["nextStep"]),
                "source": "glm",
            }

        return {
            "recommendedAction": opportunity["pipelineStage"],
            "summary": opportunity["recommendation"],
            "reasoningBullets": [
                f"Local scoring surfaced a {opportunity['fitScore']}% fit based on course, year, skills, and goal alignment.",
                f"The opportunity combines {opportunity['estimatedValue']} upside with a {opportunity['effort'].lower()} effort profile.",
                (
                    "Some readiness gaps still need attention before applying."
                    if opportunity["missingRequirements"]
                    else "Current readiness looks strong enough to move quickly."
                ),
            ],
            "tradeoff": opportunity["tradeoff"],
            "topPickRationale": "Local fallback: this opportunity stands out because it balances fit, value, urgency, and strategic value better than the rest of the current shortlist.",
            "nextStep": opportunity["nextStep"],
            "source": "fallback",
        }

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
            return {
                "recommendedAction": parsed.get("recommendedAction", opportunity["pipelineStage"]),
                "summary": parsed.get("summary", opportunity["recommendation"]),
                "reasoningBullets": parsed.get("reasoningBullets")
                or [
                    f"Strong fit score of {opportunity['fitScore']}% based on the current profile.",
                    f"Urgency score of {opportunity['urgencyScore']} reflects the deadline pressure.",
                    f"Readiness score of {opportunity['readinessScore']} shows how prepared the profile is.",
                ],
                "missingRequirements": parsed.get("missingRequirements", opportunity["missingRequirements"]),
                "topPickRationale": parsed.get(
                    "topPickRationale",
                    "GLM identified this as a high-value fit with a credible near-term path to action.",
                ),
                "source": "glm",
            }

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
            "source": "fallback",
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

    def _deadline_note(self, opportunity: dict[str, Any]) -> str:
        days = opportunity.get("daysUntilDeadline")
        if days is None:
            return "deadline timing is flexible"
        if days <= 0:
            return "deadline has already passed"
        if days == 1:
            return "deadline is in 1 day"
        return f"deadline is in {days} days"

    def _opportunity_brief(self, opportunity: dict[str, Any]) -> str:
        return (
            f"{opportunity['title']} ({opportunity['recommendedAction']}, "
            f"{opportunity['fitScore']}% fit, ROI {opportunity['roiScore']}/100, "
            f"{self._deadline_note(opportunity)}, {opportunity['estimatedValue']})"
        )

    def _advisor_fallback(
        self,
        message: str,
        profile: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        question = message.lower()
        top_opportunities = context.get("topOpportunities", [])
        scholarship_opportunities = context.get("scholarshipOpportunities", [])
        readiness = context.get("readiness", {})
        planner = context.get("planner", {})
        readiness_modules = readiness.get("modules", [])
        planner_tasks = planner.get("tasks", [])

        def top_by_stage() -> list[dict[str, Any]]:
            ranked = sorted(
                top_opportunities,
                key=lambda item: (
                    {"apply-now": 0, "prepare-soon": 1, "track-later": 2, "skip": 3}.get(
                        item["recommendedAction"], 4
                    ),
                    -item["priorityScore"],
                ),
            )
            return ranked[:3]

        def top_by_roi() -> list[dict[str, Any]]:
            return sorted(top_opportunities, key=lambda item: item["roiScore"], reverse=True)[:3]

        def weak_modules() -> list[dict[str, Any]]:
            return sorted(readiness_modules, key=lambda item: item["completion"])[:3]

        if any(token in question for token in ["priorit", "this week", "focus", "first"]):
            picks = top_by_stage()
            response = "Prioritize these opportunities this week:\n" + "\n".join(
                f"{index}. {self._opportunity_brief(item)}"
                for index, item in enumerate(picks, start=1)
            )
            if picks:
                response += f"\nStart with: {picks[0]['nextStep']}"
            return {
                "response": response,
                "citedOpportunityIds": [item["id"] for item in picks],
                "recommendedActions": [item["nextStep"] for item in picks[:3]],
                "suggestedPrompts": [
                    "Which one should I finish first today?",
                    "What is blocking my second-best option?",
                    "How should I split my next 7 days?",
                ],
                "source": "fallback",
            }

        if any(token in question for token in ["roi", "best return", "value", "highest return"]):
            picks = top_by_roi()
            response = "These look like your best ROI opportunities right now:\n" + "\n".join(
                f"{index}. {self._opportunity_brief(item)}"
                for index, item in enumerate(picks, start=1)
            )
            return {
                "response": response,
                "citedOpportunityIds": [item["id"] for item in picks],
                "recommendedActions": [item["nextStep"] for item in picks[:3]],
                "suggestedPrompts": [
                    "Which high-ROI option is easiest to finish quickly?",
                    "Compare my top internship and scholarship options",
                    "What am I missing for the best-paying option?",
                ],
                "source": "fallback",
            }

        if "scholarship" in question:
            picks = scholarship_opportunities[:3]
            if picks:
                response = (
                    "Based on your current profile, these scholarships look most relevant:\n"
                    + "\n".join(
                        f"{index}. {self._opportunity_brief(item)}"
                        for index, item in enumerate(picks, start=1)
                    )
                )
            else:
                response = (
                    "No strong scholarship matches surfaced at the top of the current shortlist yet. "
                    "That usually means your stronger near-term fit is in internships or programmes, or that more readiness work is needed before scholarships become competitive."
                )
            return {
                "response": response,
                "citedOpportunityIds": [item["id"] for item in picks],
                "recommendedActions": [item["nextStep"] for item in picks[:3]]
                or [
                    "Strengthen your transcript, essay, and referee readiness.",
                    "Track higher-fit internships while building scholarship readiness.",
                ],
                "suggestedPrompts": [
                    "What is blocking my top scholarship option?",
                    "Which scholarship should I prepare for next?",
                    "How do I improve my scholarship readiness this month?",
                ],
                "source": "fallback",
            }

        if any(token in question for token in ["missing", "gap", "block", "unlock"]):
            target = scholarship_opportunities[0] if scholarship_opportunities else (top_opportunities[0] if top_opportunities else None)
            missing = target.get("missingRequirements", []) if target else []
            weak = weak_modules()
            response_parts = []
            if target:
                response_parts.append(
                    f"For {target['title']}, the main gaps right now are: "
                    + (", ".join(missing) if missing else "no major missing requirements from the current profile.")
                )
            if weak:
                response_parts.append(
                    "The weakest readiness areas are "
                    + ", ".join(f"{item['title']} ({item['completion']}%)" for item in weak)
                    + "."
                )
            response_parts.append("Fix the highest-impact missing asset first, then move back to the top-fit opportunity.")
            return {
                "response": " ".join(response_parts),
                "citedOpportunityIds": [target["id"]] if target else [],
                "recommendedActions": [
                    f"Improve {item['title']}" for item in weak[:3]
                ] or ["Close the top readiness gap before applying."],
                "suggestedPrompts": [
                    "Which missing asset matters most?",
                    "What can I fix in the next 3 days?",
                    "How much would my fit improve if I close these gaps?",
                ],
                "source": "fallback",
            }

        if any(token in question for token in ["plan", "7 days", "next week", "next 7", "schedule"]):
            tasks = planner_tasks[:5]
            response = "Here is a practical next-step plan for the coming week:\n" + "\n".join(
                f"{index}. {task['title']} ({task['dueLabel']}, {task['duration']})"
                for index, task in enumerate(tasks, start=1)
            )
            if planner.get("focusTip"):
                response += f"\nFocus tip: {planner['focusTip']}"
            return {
                "response": response,
                "citedOpportunityIds": [
                    task["opportunityId"]
                    for task in tasks
                    if task.get("opportunityId")
                ],
                "recommendedActions": [task["title"] for task in tasks[:3]],
                "suggestedPrompts": [
                    "What should I do first today?",
                    "Which task can I safely defer?",
                    "How can I improve my weekly focus score?",
                ],
                "source": "fallback",
            }

        if any(token in question for token in ["goal", "career", "best fit", "align"]):
            picks = top_by_stage()
            weak = weak_modules()
            response = (
                f"Your current profile points most strongly toward {profile.get('goal', 'high-value opportunities').lower()}. "
                "The best-aligned options right now are "
                + ", ".join(item["title"] for item in picks[:3])
                + ". "
            )
            if weak:
                response += (
                    "To unlock even better matches, strengthen "
                    + ", ".join(item["title"] for item in weak[:2])
                    + "."
                )
            return {
                "response": response,
                "citedOpportunityIds": [item["id"] for item in picks],
                "recommendedActions": [item["nextStep"] for item in picks[:3]],
                "suggestedPrompts": [
                    "Which opportunity best fits my long-term goals?",
                    "Should I focus on internships or scholarships first?",
                    "What profile upgrade would change my top matches most?",
                ],
                "source": "fallback",
            }

        picks = top_by_stage()
        weak = weak_modules()
        response = (
            "Based on your current profile, I would focus first on "
            + ", ".join(item["title"] for item in picks[:2])
            + ". "
        )
        if weak:
            response += (
                "Your main readiness drag is "
                + ", ".join(f"{item['title']} ({item['completion']}%)" for item in weak[:2])
                + ". "
            )
        if picks:
            response += f"Next step: {picks[0]['nextStep']}"
        return {
            "response": response,
            "citedOpportunityIds": [item["id"] for item in picks],
            "recommendedActions": [item["nextStep"] for item in picks[:3]],
            "suggestedPrompts": [
                "Which opportunities should I prioritize this week?",
                "Show me high ROI opportunities",
                "What am I missing based on my profile?",
            ],
            "source": "fallback",
        }

    def advisor_reply(
        self,
        profile: dict[str, Any],
        message: str,
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
            "message": message,
            "history": history[-6:],
            "context": context,
            "timestamp": datetime.now(UTC).isoformat(),
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
                max_tokens=900,
                reasoning_effort="low",
            )
        except Exception:
            parsed = None

        if parsed and parsed.get("response"):
            return {
                "response": parsed["response"],
                "citedOpportunityIds": parsed.get("citedOpportunityIds", []),
                "recommendedActions": parsed.get("recommendedActions", []),
                "suggestedPrompts": parsed.get("suggestedPrompts", []),
                "source": "glm",
            }

        return self._advisor_fallback(message, profile, context)
