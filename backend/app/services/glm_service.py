from __future__ import annotations

import hashlib
import json
import time
from datetime import UTC, datetime
from typing import Any

import requests

from app.config import Settings
from app.models.api import AIObservabilityStats, PromptModeStats, SharedAIContract
from app.services.state_store import JsonStateStore


class GLMService:
    def __init__(self, settings: Settings, store: JsonStateStore):
        self.settings = settings
        self.store = store
        self.cache_path = self.store.statePath("ai_cache.json")
        self.cache: dict[str, Any] = self.store.load_json(self.cache_path, default={})
        self.short_timeout_seconds = max(4, self.settings.zAiTimeoutSeconds)
        self._stats: dict[str, Any] = {
            "cacheHits": 0,
            "cacheMisses": 0,
            "liveSuccesses": 0,
            "liveFailures": 0,
            "malformedResponses": 0,
            "emptyResponses": 0,
            "byPromptMode": {},
        }

    @property
    def enabled(self) -> bool:
        return bool(self.settings.zAiApiKey)

    def stats_snapshot(self) -> dict[str, Any]:
        return AIObservabilityStats.model_validate(self._stats).model_dump(mode="json")

    def _ensure_mode_stats(self, mode: str) -> dict[str, Any]:
        by_mode = self._stats["byPromptMode"]
        if mode not in by_mode:
            by_mode[mode] = PromptModeStats().model_dump(mode="json")
        return by_mode[mode]

    def _record_mode_call(self, mode: str) -> None:
        self._ensure_mode_stats(mode)["calls"] += 1

    def _record_cache_hit(self, mode: str) -> None:
        self._stats["cacheHits"] += 1
        mode_stats = self._ensure_mode_stats(mode)
        mode_stats["cacheHits"] += 1

    def _record_cache_miss(self, mode: str) -> None:
        self._stats["cacheMisses"] += 1
        mode_stats = self._ensure_mode_stats(mode)
        mode_stats["cacheMisses"] += 1

    def _record_live_success(self, mode: str, latency_ms: float) -> None:
        self._stats["liveSuccesses"] += 1
        mode_stats = self._ensure_mode_stats(mode)
        mode_stats["liveSuccesses"] += 1
        successes = mode_stats["liveSuccesses"]
        previous = mode_stats["avgLatencyMs"]
        mode_stats["avgLatencyMs"] = round((((previous * (successes - 1)) + latency_ms) / successes), 2)

    def _record_live_failure(self, mode: str) -> None:
        self._stats["liveFailures"] += 1
        self._ensure_mode_stats(mode)["liveFailures"] += 1

    def _record_malformed(self, mode: str) -> None:
        self._stats["malformedResponses"] += 1
        self._ensure_mode_stats(mode)["malformedResponses"] += 1

    def _record_empty(self, mode: str) -> None:
        self._stats["emptyResponses"] += 1
        self._ensure_mode_stats(mode)["emptyResponses"] += 1

    def _record_fallback(self, mode: str) -> None:
        self._ensure_mode_stats(mode)["fallbacks"] += 1

    def _cache_metadata(self, mode: str, user_payload: dict[str, Any]) -> dict[str, Any]:
        profile_blob = json.dumps(user_payload.get("profile", {}), sort_keys=True, ensure_ascii=True)
        opportunity_ids = sorted(set(self._extract_ids(user_payload)))
        message = user_payload.get("message", "")
        return {
            "mode": mode,
            "profileHash": hashlib.sha256(profile_blob.encode("utf-8")).hexdigest(),
            "opportunityIds": opportunity_ids,
            "messageHash": hashlib.sha256(str(message).encode("utf-8")).hexdigest(),
        }

    def _cache_key(self, mode: str, user_payload: dict[str, Any]) -> str:
        metadata = self._cache_metadata(mode, user_payload)
        blob = json.dumps(metadata, sort_keys=True, ensure_ascii=True)
        return hashlib.sha256(blob.encode("utf-8")).hexdigest()

    def _extract_ids(self, payload: Any) -> list[str]:
        ids: list[str] = []
        if isinstance(payload, dict):
            for key, value in payload.items():
                if key in {"id", "opportunityId"} and isinstance(value, str):
                    ids.append(value)
                else:
                    ids.extend(self._extract_ids(value))
        elif isinstance(payload, list):
            for item in payload:
                ids.extend(self._extract_ids(item))
        return ids

    def _build_request_payload(
        self,
        *,
        system_prompt: str,
        user_payload: dict[str, Any],
        max_tokens: int,
        reasoning_effort: str,
    ) -> dict[str, Any]:
        effective_max_tokens = max_tokens
        if self.settings.zAiModel.lower().startswith("ilmu-"):
            effective_max_tokens = max(max_tokens, 3600)
        thinking_type = "enabled" if reasoning_effort == "high" else "disabled"
        return {
            "model": self.settings.zAiModel,
            "temperature": 0.15,
            "stream": False,
            "response_format": {"type": "json_object"},
            "thinking": {"type": thinking_type},
            "max_tokens": effective_max_tokens,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_payload, ensure_ascii=True)},
            ],
        }

    def _request_json(self, mode: str, request: dict[str, Any]) -> dict[str, Any] | None:
        self._record_mode_call(mode)
        user_payload = request["user_payload"]
        cache_key = self._cache_key(mode, user_payload)
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            cached_response = cached.get("response") if isinstance(cached, dict) else None
            if isinstance(cached_response, dict):
                self._record_cache_hit(mode)
                return cached_response
        self._record_cache_miss(mode)

        if not self.enabled:
            self._record_fallback(mode)
            return None

        request_payload = self._build_request_payload(
            system_prompt=request["system_prompt"],
            user_payload=user_payload,
            max_tokens=request["max_tokens"],
            reasoning_effort=request["reasoning_effort"],
        )

        started = time.perf_counter()
        try:
            parsed = self._post_with_retries(request_payload)
        except json.JSONDecodeError:
            self._record_malformed(mode)
            self._record_live_failure(mode)
            self._record_fallback(mode)
            return None
        except ValueError as error:
            if "empty content" in str(error).lower():
                self._record_empty(mode)
            else:
                self._record_malformed(mode)
            self._record_live_failure(mode)
            self._record_fallback(mode)
            return None
        except requests.RequestException:
            self._record_live_failure(mode)
            self._record_fallback(mode)
            return None
        except Exception:
            self._record_live_failure(mode)
            self._record_fallback(mode)
            return None

        latency_ms = (time.perf_counter() - started) * 1000
        self._record_live_success(mode, latency_ms)

        self.cache[cache_key] = {
            **self._cache_metadata(mode, user_payload),
            "cachedAt": datetime.now(UTC).isoformat(),
            "response": parsed,
        }
        self.store.save_json(self.cache_path, self.cache)
        return parsed

    def _post_with_retries(self, request_payload: dict[str, Any]) -> dict[str, Any]:
        last_error: Exception | None = None
        for attempt in range(2):
            try:
                return self._post_once(request_payload)
            except requests.HTTPError as error:
                last_error = error
                status = error.response.status_code if error.response is not None else None
                response_text = error.response.text.lower() if error.response is not None else ""
                should_retry = status is None or status >= 500 or status == 429
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
                if not should_retry:
                    raise
            except (ValueError, KeyError, json.JSONDecodeError, TypeError) as error:
                last_error = error
                break
            except requests.RequestException as error:
                last_error = error
                if attempt == 1:
                    break
            time.sleep(0.4 * (attempt + 1))
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
            timeout=self.short_timeout_seconds,
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

    def _coerce_string_list(self, value: Any) -> list[str]:
        if not isinstance(value, list):
            return []
        return [str(item).strip() for item in value if str(item).strip()]

    def _format_currency(self, value: int) -> str:
        return f"RM{value:,.0f}"

    def _opportunity_uncertain_fields(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
    ) -> list[str]:
        uncertain: list[str] = []
        if not profile.get("goal"):
            uncertain.append("student_goal")
        if not profile.get("skills"):
            uncertain.append("skills")
        if not profile.get("interests"):
            uncertain.append("interests")
        if not opportunity.get("deadlineIso") and not opportunity.get("deadline"):
            uncertain.append("deadline")
        if opportunity.get("eligibility") == "Low":
            uncertain.append("eligibility_fit")
        if opportunity.get("missingRequirements"):
            uncertain.append("application_assets")
        return sorted(set(uncertain))

    def _confidence_bundle(
        self,
        *,
        source: str,
        fit_score: int,
        readiness_score: int,
        uncertain_fields: list[str],
        missing_requirements: list[str],
    ) -> tuple[int, str]:
        score = 82 if source == "glm" else 64
        score += max(-8, min(8, (fit_score - 70) // 5))
        score += max(-6, min(6, (readiness_score - 60) // 7))
        score -= min(18, len(uncertain_fields) * 6)
        score -= min(12, len(missing_requirements) * 3)
        score = max(24, min(95, score))

        if score >= 82:
            reason = "High confidence because the profile fit, readiness, and opportunity context are all fairly clear."
        elif score >= 65:
            reason = "Moderate confidence because the current profile is directionally strong, but some readiness or eligibility uncertainty remains."
        else:
            reason = "Lower confidence because important profile or eligibility details are still missing or unclear."
        return score, reason

    def _build_opportunity_economic_details(self, opportunity: dict[str, Any]) -> dict[str, Any]:
        raw_value = int(opportunity.get("estimatedValueRaw") or 0)
        stage = opportunity.get("pipelineStage", "track-later")
        days_until = opportunity.get("daysUntilDeadline")
        estimated_value_unlocked = raw_value
        if raw_value:
            estimated_value_unlocked = {
                "apply-now": int(raw_value * 0.92),
                "prepare-soon": int(raw_value * 0.68),
                "track-later": int(raw_value * 0.36),
                "skip": int(raw_value * 0.12),
            }.get(stage, raw_value)
        elif opportunity.get("fitScore"):
            estimated_value_unlocked = int(opportunity["fitScore"] * 180)

        value_at_risk = 0
        if raw_value:
            if days_until is not None and days_until <= 7:
                value_at_risk = raw_value
            elif days_until is not None and days_until <= 30:
                value_at_risk = int(raw_value * 0.45)
            else:
                value_at_risk = int(raw_value * 0.15)

        time_saved_estimate = round(
            max(1.0, min(8.0, (opportunity.get("fitScore", 0) / 18) + (2.0 if stage != "skip" else 0.5))),
            1,
        )

        category = opportunity.get("category", "opportunity").lower()
        strategic_value = int(opportunity.get("strategicValue") or 0)
        if category == "internship":
            narrative = "This strengthens near-term employability and gives a direct pathway into paid work."
        elif category == "scholarship":
            narrative = "This can reduce education costs while also improving long-term academic mobility."
        elif category == "grant":
            narrative = "This can fund experimentation early and create leverage for a startup or side project."
        elif category == "certification":
            narrative = "This adds credibility quickly and can unlock better-fit applications later."
        else:
            narrative = "This has broader strategic upside if it is pursued at the right time."
        if strategic_value >= 85:
            narrative = f"{narrative} It also has unusually strong long-term strategic value."

        economic_impact = (
            f"Estimated value unlocked is about {self._format_currency(estimated_value_unlocked)}. "
            f"Value currently at risk is about {self._format_currency(value_at_risk)}."
        )

        return {
            "estimatedValueUnlocked": estimated_value_unlocked,
            "valueAtRisk": value_at_risk,
            "timeSavedEstimate": time_saved_estimate,
            "strategicValueNarrative": narrative,
            "economicImpact": economic_impact,
        }

    def _why_not_now(self, opportunity: dict[str, Any]) -> str:
        stage = opportunity.get("pipelineStage")
        missing = self._coerce_string_list(opportunity.get("missingRequirements", []))
        if stage == "apply-now":
            return "No reason to defer: the current fit, timing, and readiness are already strong enough to act this week."
        if stage == "prepare-soon":
            if missing:
                return f"This is not apply-now yet because {', '.join(missing[:2])} still needs attention."
            return "This is close, but readiness or effort is still preventing a confident apply-now move."
        if stage == "track-later":
            return "This has some fit, but the current upside and timing are not strong enough to beat your best active options."
        return "This is not worth active time yet because current fit, readiness, or payoff is weaker than stronger alternatives."

    def _opportunity_contract_fallback(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
        *,
        source: str = "fallback",
        summary: str | None = None,
        reasoning_bullets: list[str] | None = None,
        tradeoff: str | None = None,
        next_step: str | None = None,
    ) -> dict[str, Any]:
        uncertain_fields = self._opportunity_uncertain_fields(profile, opportunity)
        confidence_score, confidence_reason = self._confidence_bundle(
            source=source,
            fit_score=int(opportunity.get("fitScore", 0)),
            readiness_score=int(opportunity.get("readinessScore", 0)),
            uncertain_fields=uncertain_fields,
            missing_requirements=self._coerce_string_list(opportunity.get("missingRequirements", [])),
        )
        economic_details = self._build_opportunity_economic_details(opportunity)

        fallback = SharedAIContract(
            summary=summary or opportunity.get("recommendation", ""),
            reasoningBullets=reasoning_bullets
            or [
                f"Fit score is {opportunity.get('fitScore', 0)}% based on your current course, year, and goal alignment.",
                f"Urgency score is {opportunity.get('urgencyScore', 0)}, so timing is a real factor here.",
                (
                    "Some readiness gaps still need work before this becomes frictionless to pursue."
                    if opportunity.get("missingRequirements")
                    else "Current readiness is strong enough to move without major extra prep."
                ),
            ],
            tradeoff=tradeoff or opportunity.get("tradeoff", ""),
            whyNotNow=self._why_not_now(opportunity),
            nextStep=next_step or opportunity.get("nextStep", ""),
            economicImpact=economic_details["economicImpact"],
            confidenceScore=confidence_score,
            confidenceReason=confidence_reason,
            uncertainFields=uncertain_fields,
            source=source,
        ).model_dump(mode="json")
        return {**fallback, **economic_details}

    def _normalize_opportunity_contract(
        self,
        parsed: dict[str, Any] | None,
        fallback: dict[str, Any],
        *,
        source: str,
    ) -> dict[str, Any]:
        if not parsed:
            return fallback
        contract = SharedAIContract(
            summary=str(parsed.get("summary") or fallback["summary"]),
            reasoningBullets=self._coerce_string_list(parsed.get("reasoningBullets")) or fallback["reasoningBullets"],
            tradeoff=str(parsed.get("tradeoff") or fallback["tradeoff"]),
            whyNotNow=str(parsed.get("whyNotNow") or fallback["whyNotNow"]),
            nextStep=str(parsed.get("nextStep") or fallback["nextStep"]),
            economicImpact=str(parsed.get("economicImpact") or fallback["economicImpact"]),
            confidenceScore=int(parsed.get("confidenceScore") or fallback["confidenceScore"]),
            confidenceReason=str(parsed.get("confidenceReason") or fallback["confidenceReason"]),
            uncertainFields=self._coerce_string_list(parsed.get("uncertainFields")) or fallback["uncertainFields"],
            source=source,
        ).model_dump(mode="json")
        return {
            **fallback,
            **contract,
            "estimatedValueUnlocked": fallback["estimatedValueUnlocked"],
            "valueAtRisk": fallback["valueAtRisk"],
            "timeSavedEstimate": fallback["timeSavedEstimate"],
            "strategicValueNarrative": fallback["strategicValueNarrative"],
        }

    def _general_contract(
        self,
        *,
        summary: str,
        reasoning_bullets: list[str],
        tradeoff: str,
        why_not_now: str,
        next_step: str,
        economic_impact: str,
        source: str,
        confidence_base: int,
        uncertain_fields: list[str] | None = None,
    ) -> dict[str, Any]:
        uncertain_fields = sorted(set(uncertain_fields or []))
        confidence_score = max(24, min(95, confidence_base - (len(uncertain_fields) * 6)))
        if confidence_score >= 82:
            confidence_reason = "High confidence because the supporting context is concrete and internally consistent."
        elif confidence_score >= 65:
            confidence_reason = "Moderate confidence because the key pattern is clear, but some context is still incomplete."
        else:
            confidence_reason = "Lower confidence because some of the supporting context is still sparse."
        return SharedAIContract(
            summary=summary,
            reasoningBullets=reasoning_bullets,
            tradeoff=tradeoff,
            whyNotNow=why_not_now,
            nextStep=next_step,
            economicImpact=economic_impact,
            confidenceScore=confidence_score,
            confidenceReason=confidence_reason,
            uncertainFields=uncertain_fields,
            source=source,
        ).model_dump(mode="json")

    def _normalize_general_contract(
        self,
        parsed: dict[str, Any] | None,
        fallback: dict[str, Any],
        *,
        source: str,
    ) -> dict[str, Any]:
        if not parsed:
            return fallback
        contract = SharedAIContract(
            summary=str(parsed.get("summary") or fallback["summary"]),
            reasoningBullets=self._coerce_string_list(parsed.get("reasoningBullets")) or fallback["reasoningBullets"],
            tradeoff=str(parsed.get("tradeoff") or fallback["tradeoff"]),
            whyNotNow=str(parsed.get("whyNotNow") or fallback["whyNotNow"]),
            nextStep=str(parsed.get("nextStep") or fallback["nextStep"]),
            economicImpact=str(parsed.get("economicImpact") or fallback["economicImpact"]),
            confidenceScore=int(parsed.get("confidenceScore") or fallback["confidenceScore"]),
            confidenceReason=str(parsed.get("confidenceReason") or fallback["confidenceReason"]),
            uncertainFields=self._coerce_string_list(parsed.get("uncertainFields")) or fallback["uncertainFields"],
            source=source,
        ).model_dump(mode="json")
        return {**fallback, **contract}

    def _build_candidate_shortlist_request(
        self,
        profile: dict[str, Any],
        candidates: list[dict[str, Any]],
    ) -> dict[str, Any]:
        return {
            "system_prompt": (
                "You are OpportunIQ's shortlist reasoning engine. "
                "Local scoring already identified candidate opportunities. "
                "For each candidate, explain why it is or is not worth attention now, "
                "describe the trade-off, and recommend the next action. Return JSON only."
            ),
            "user_payload": {
                "task": "Enhance a shortlist of student opportunities.",
                "profile": profile,
                "candidates": [
                    {
                        "id": candidate["id"],
                        "title": candidate["title"],
                        "category": candidate["category"],
                        "fitScore": candidate["fitScore"],
                        "urgencyScore": candidate["urgencyScore"],
                        "readinessScore": candidate["readinessScore"],
                        "estimatedValue": candidate["estimatedValue"],
                        "pipelineStage": candidate["pipelineStage"],
                        "missingRequirements": candidate["missingRequirements"][:3],
                        "nextStep": candidate["nextStep"],
                    }
                    for candidate in candidates[:3]
                ],
                "outputSchema": {
                    "results": [
                        {
                            "id": "string",
                            "summary": "string",
                            "tradeoff": "string",
                            "whyNotNow": "string",
                            "nextStep": "string",
                            "confidenceScore": 72,
                            "confidenceReason": "string",
                            "uncertainFields": ["string"],
                            "recommendedAction": "apply-now | prepare-soon | track-later | skip",
                            "readinessGap": "string",
                            "risk": "string",
                            "fitLabel": "string",
                            "topPickRationale": "string",
                        }
                    ]
                },
            },
            "max_tokens": 850,
            "reasoning_effort": "low",
        }

    def explain_candidates(
        self,
        profile: dict[str, Any],
        candidates: list[dict[str, Any]],
    ) -> dict[str, dict[str, Any]]:
        if not candidates:
            return {}

        request = self._build_candidate_shortlist_request(profile, candidates)
        parsed = self._request_json("candidate_shortlist", request)
        result_map: dict[str, Any] = {}
        parsed_results = {
            str(item.get("id")): item
            for item in (parsed or {}).get("results", [])
            if item.get("id")
        }

        for candidate in candidates[:3]:
            fallback = self._opportunity_contract_fallback(profile, candidate)
            normalized = self._normalize_opportunity_contract(
                parsed_results.get(candidate["id"]),
                fallback,
                source="glm" if candidate["id"] in parsed_results else "fallback",
            )
            result_map[candidate["id"]] = {
                "recommendedAction": str(
                    (parsed_results.get(candidate["id"]) or {}).get("recommendedAction")
                    or candidate["pipelineStage"]
                ),
                "reasoningSummary": normalized["summary"],
                "reasoningBullets": normalized["reasoningBullets"],
                "whyRecommended": normalized["summary"],
                "tradeoff": normalized["tradeoff"],
                "whyNotNow": normalized["whyNotNow"],
                "readinessGap": str(
                    (parsed_results.get(candidate["id"]) or {}).get("readinessGap")
                    or (
                        ", ".join(candidate["missingRequirements"])
                        if candidate["missingRequirements"]
                        else "No major readiness gaps surfaced from the current profile."
                    )
                ),
                "risk": str(
                    (parsed_results.get(candidate["id"]) or {}).get("risk") or candidate["risk"]
                ),
                "nextStep": str(
                    (parsed_results.get(candidate["id"]) or {}).get("nextStep")
                    or normalized["nextStep"]
                ),
                "fitLabel": str(
                    (parsed_results.get(candidate["id"]) or {}).get("fitLabel")
                    or candidate["fitLabel"]
                ),
                "topPickRationale": str(
                    (parsed_results.get(candidate["id"]) or {}).get("topPickRationale")
                    or "This surfaced because it balances fit, timing, and realistic economic upside."
                ),
                "economicImpact": normalized["economicImpact"],
                "estimatedValueUnlocked": normalized["estimatedValueUnlocked"],
                "valueAtRisk": normalized["valueAtRisk"],
                "timeSavedEstimate": normalized["timeSavedEstimate"],
                "strategicValueNarrative": normalized["strategicValueNarrative"],
                "confidenceScore": normalized["confidenceScore"],
                "confidenceReason": normalized["confidenceReason"],
                "uncertainFields": normalized["uncertainFields"],
                "source": normalized["source"],
            }
        return result_map

    def _build_dashboard_featured_request(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "system_prompt": (
                "You are OpportunIQ's dashboard explainer. "
                "Local scoring has already identified the current best visible opportunity. "
                "Explain why it is the best use of attention now, the main trade-off, what would make it worse, "
                "and the next practical step. Return JSON only."
            ),
            "user_payload": {
                "task": "Explain the featured opportunity on the dashboard.",
                "profile": profile,
                "opportunity": {
                    "id": opportunity["id"],
                    "title": opportunity["title"],
                    "company": opportunity["company"],
                    "category": opportunity["category"],
                    "deadline": opportunity["deadline"],
                    "estimatedValue": opportunity["estimatedValue"],
                    "fitScore": opportunity["fitScore"],
                    "urgencyScore": opportunity["urgencyScore"],
                    "readinessScore": opportunity["readinessScore"],
                    "pipelineStage": opportunity["pipelineStage"],
                    "missingRequirements": opportunity["missingRequirements"][:3],
                    "nextStep": opportunity["nextStep"],
                },
                "outputSchema": {
                    "recommendedAction": "apply-now | prepare-soon | track-later | skip",
                    "summary": "string",
                    "reasoningBullets": ["string"],
                    "tradeoff": "string",
                    "whyNotNow": "string",
                    "nextStep": "string",
                    "economicImpact": "string",
                    "confidenceScore": 78,
                    "confidenceReason": "string",
                    "uncertainFields": ["string"],
                    "topPickRationale": "string",
                },
            },
            "max_tokens": 650,
            "reasoning_effort": "low",
        }

    def explain_featured_recommendation(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
    ) -> dict[str, Any]:
        request = self._build_dashboard_featured_request(profile, opportunity)
        parsed = self._request_json("dashboard_featured", request)
        fallback = self._opportunity_contract_fallback(profile, opportunity)
        normalized = self._normalize_opportunity_contract(parsed, fallback, source="glm" if parsed else "fallback")
        return {
            "recommendedAction": str(parsed.get("recommendedAction") if parsed else opportunity["pipelineStage"]),
            "summary": normalized["summary"],
            "reasoningBullets": normalized["reasoningBullets"],
            "tradeoff": normalized["tradeoff"],
            "whyNotNow": normalized["whyNotNow"],
            "nextStep": normalized["nextStep"],
            "economicImpact": normalized["economicImpact"],
            "estimatedValueUnlocked": normalized["estimatedValueUnlocked"],
            "valueAtRisk": normalized["valueAtRisk"],
            "timeSavedEstimate": normalized["timeSavedEstimate"],
            "strategicValueNarrative": normalized["strategicValueNarrative"],
            "confidenceScore": normalized["confidenceScore"],
            "confidenceReason": normalized["confidenceReason"],
            "uncertainFields": normalized["uncertainFields"],
            "topPickRationale": str(
                (parsed or {}).get("topPickRationale")
                or "This is the strongest current blend of fit, timing, and economic upside."
            ),
            "source": normalized["source"],
        }

    def _build_opportunity_detail_request(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "system_prompt": (
                "You are OpportunIQ's opportunity detail analyst. "
                "Local scoring already surfaced a relevant opportunity. "
                "Explain why it is or is not worth acting on now, identify the main blockers, "
                "and provide a short economic-impact explanation. Return JSON only."
            ),
            "user_payload": {
                "task": "Analyze a single opportunity for a student.",
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
                    "pipelineStage": opportunity["pipelineStage"],
                    "requiredDocuments": opportunity["requiredDocuments"][:6],
                    "missingRequirements": opportunity["missingRequirements"][:4],
                    "description": opportunity["description"],
                },
                "outputSchema": {
                    "recommendedAction": "string",
                    "summary": "string",
                    "reasoningBullets": ["string"],
                    "tradeoff": "string",
                    "whyNotNow": "string",
                    "nextStep": "string",
                    "economicImpact": "string",
                    "confidenceScore": 76,
                    "confidenceReason": "string",
                    "uncertainFields": ["string"],
                    "missingRequirements": ["string"],
                    "topPickRationale": "string",
                },
            },
            "max_tokens": 850,
            "reasoning_effort": "medium",
        }

    def explain_opportunity_detail(
        self,
        profile: dict[str, Any],
        opportunity: dict[str, Any],
    ) -> dict[str, Any]:
        request = self._build_opportunity_detail_request(profile, opportunity)
        parsed = self._request_json("opportunity_detail", request)
        fallback = self._opportunity_contract_fallback(profile, opportunity)
        normalized = self._normalize_opportunity_contract(parsed, fallback, source="glm" if parsed else "fallback")
        return {
            "recommendedAction": str(parsed.get("recommendedAction") if parsed else opportunity["pipelineStage"]),
            "summary": normalized["summary"],
            "reasoningBullets": normalized["reasoningBullets"],
            "tradeoff": normalized["tradeoff"],
            "whyNotNow": normalized["whyNotNow"],
            "nextStep": normalized["nextStep"],
            "economicImpact": normalized["economicImpact"],
            "estimatedValueUnlocked": normalized["estimatedValueUnlocked"],
            "valueAtRisk": normalized["valueAtRisk"],
            "timeSavedEstimate": normalized["timeSavedEstimate"],
            "strategicValueNarrative": normalized["strategicValueNarrative"],
            "confidenceScore": normalized["confidenceScore"],
            "confidenceReason": normalized["confidenceReason"],
            "uncertainFields": normalized["uncertainFields"],
            "missingRequirements": self._coerce_string_list((parsed or {}).get("missingRequirements"))
            or opportunity["missingRequirements"],
            "topPickRationale": str(
                (parsed or {}).get("topPickRationale")
                or "This surfaced because it has enough fit and upside to justify close evaluation."
            ),
            "source": normalized["source"],
        }

    def _build_readiness_summary_request(
        self,
        profile: dict[str, Any],
        modules: list[dict[str, Any]],
        opportunities: list[dict[str, Any]],
        behavior_signals: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        return {
            "system_prompt": (
                "You are OpportunIQ's readiness coach. "
                "Interpret readiness modules against the student's highest-value current opportunities. "
                "Explain what is blocking action now, what to fix first, and what would likely unlock better outcomes. "
                "Return JSON only."
            ),
            "user_payload": {
                "task": "Summarize readiness and unblock the next best actions.",
                "profile": profile,
                "behaviorSignals": behavior_signals or {},
                "modules": [
                    {
                        "title": module["title"],
                        "completion": module["completion"],
                        "impact": module["impact"],
                        "status": module["status"],
                    }
                    for module in modules[:6]
                ],
                "opportunities": [
                    {
                        "id": opportunity["id"],
                        "title": opportunity["title"],
                        "category": opportunity["category"],
                        "fitScore": opportunity["fitScore"],
                        "pipelineStage": opportunity["pipelineStage"],
                        "missingRequirements": opportunity["missingRequirements"][:3],
                    }
                    for opportunity in opportunities[:3]
                ],
                "outputSchema": {
                    "summary": "string",
                    "reasoningBullets": ["string"],
                    "tradeoff": "string",
                    "whyNotNow": "string",
                    "nextStep": "string",
                    "economicImpact": "string",
                    "confidenceScore": 70,
                    "confidenceReason": "string",
                    "uncertainFields": ["string"],
                    "tip": "string",
                    "checklist": [{"label": "string", "impact": "High Impact | Medium Impact"}],
                    "blockerNarrative": "string",
                },
            },
            "max_tokens": 900,
            "reasoning_effort": "medium",
        }

    def readiness_insights(
        self,
        profile: dict[str, Any],
        modules: list[dict[str, Any]],
        opportunities: list[dict[str, Any]],
        *,
        behavior_signals: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        request = self._build_readiness_summary_request(profile, modules, opportunities, behavior_signals)
        parsed = self._request_json("readiness_summary", request)
        weakest_modules = sorted(modules, key=lambda item: item["completion"])[:3]
        blocked_value = sum(int(item.get("estimatedValueRaw") or 0) for item in opportunities[:3])
        fallback = self._general_contract(
            summary="Readiness is currently strongest where your core application assets are already complete.",
            reasoning_bullets=[
                f"The weakest readiness area right now is {weakest_modules[0]['title']}." if weakest_modules else "Most readiness modules are reasonably healthy.",
                "Closing the highest-impact missing asset should move your best opportunities forward faster.",
                "Readiness improvements matter most when they support already high-fit opportunities.",
            ],
            tradeoff="Short-term prep work now should improve conversion probability later.",
            why_not_now="Some opportunities are still being held back by missing documents or incomplete readiness modules.",
            next_step=f"Focus first on {weakest_modules[0]['title']}." if weakest_modules else "Protect your strongest ready-to-apply opportunities.",
            economic_impact=(
                f"Improving the top blockers could protect up to {self._format_currency(blocked_value)} of near-term opportunity value."
                if blocked_value
                else "Improving readiness should increase the quality of your next shortlist."
            ),
            source="fallback",
            confidence_base=68,
            uncertain_fields=["readiness_depth"] if not weakest_modules else [],
        )
        normalized = self._normalize_general_contract(parsed, fallback, source="glm" if parsed else "fallback")
        checklist = (
            (parsed or {}).get("checklist")
            if isinstance((parsed or {}).get("checklist"), list)
            else [
                {
                    "label": f"Improve {module['title']}",
                    "impact": "High Impact" if module["impact"] == "High" else "Medium Impact",
                }
                for module in weakest_modules[:5]
            ]
        )
        return {
            **normalized,
            "tip": str(
                (parsed or {}).get("tip")
                or "Fix the highest-impact missing asset first, then revisit your best-fit opportunity."
            ),
            "checklist": checklist,
            "blockerNarrative": str(
                (parsed or {}).get("blockerNarrative")
                or "Current readiness is mainly constrained by incomplete application assets."
            ),
        }

    def _build_planner_strategy_request(
        self,
        profile: dict[str, Any],
        tasks: list[dict[str, Any]],
        opportunities: list[dict[str, Any]],
    ) -> dict[str, Any]:
        return {
            "system_prompt": (
                "You are OpportunIQ's weekly planner strategist. "
                "Local scoring already prioritized the relevant opportunities. "
                "Explain why the plan is structured this way, what trade-off it makes, and one smarter reallocation. "
                "Return JSON only."
            ),
            "user_payload": {
                "task": "Explain and optimize a weekly action plan.",
                "profile": profile,
                "tasks": [
                    {
                        "title": task["title"],
                        "type": task["type"],
                        "durationMinutes": task["durationMinutes"],
                        "completed": task["completed"],
                    }
                    for task in tasks[:8]
                ],
                "opportunities": [
                    {
                        "id": opportunity["id"],
                        "title": opportunity["title"],
                        "recommendedAction": opportunity.get("recommendedAction", opportunity["pipelineStage"]),
                        "fitScore": opportunity["fitScore"],
                        "deadline": opportunity["deadline"],
                    }
                    for opportunity in opportunities[:4]
                ],
                "outputSchema": {
                    "summary": "string",
                    "reasoningBullets": ["string"],
                    "tradeoff": "string",
                    "whyNotNow": "string",
                    "nextStep": "string",
                    "economicImpact": "string",
                    "confidenceScore": 72,
                    "confidenceReason": "string",
                    "uncertainFields": ["string"],
                    "rationale": ["string"],
                    "optimization": {"title": "string", "text": "string"},
                    "focusTip": "string",
                },
            },
            "max_tokens": 850,
            "reasoning_effort": "medium",
        }

    def planner_strategy(
        self,
        profile: dict[str, Any],
        tasks: list[dict[str, Any]],
        opportunities: list[dict[str, Any]],
    ) -> dict[str, Any]:
        request = self._build_planner_strategy_request(profile, tasks, opportunities)
        parsed = self._request_json("planner_strategy", request)
        apply_now_tasks = len([task for task in tasks if task["type"] == "apply-now"])
        fallback = self._general_contract(
            summary="The plan is front-loading the best combination of value, urgency, and realistic execution.",
            reasoning_bullets=[
                "High-value and high-urgency work is placed earlier in the week.",
                "Preparation work is sequenced ahead of lower-value research tasks.",
                "The planner is trying to preserve enough focus for applications that can move now.",
            ],
            tradeoff="You are sacrificing some lower-urgency exploration time to protect near-term conversion.",
            why_not_now="Some lower-priority tasks are intentionally delayed so the strongest opportunities do not slip.",
            next_step="Finish the highest-value apply-now task before moving to medium-ROI preparation.",
            economic_impact=(
                f"Protecting your top {apply_now_tasks} apply-now tasks should preserve the highest near-term capture potential."
                if apply_now_tasks
                else "A tighter plan should reduce time waste and improve execution quality."
            ),
            source="fallback",
            confidence_base=70,
            uncertain_fields=[],
        )
        normalized = self._normalize_general_contract(parsed, fallback, source="glm" if parsed else "fallback")
        return {
            **normalized,
            "rationale": self._coerce_string_list((parsed or {}).get("rationale"))
            or fallback["reasoningBullets"],
            "optimization": (parsed or {}).get("optimization")
            or {
                "title": "Reallocate one lower-value block",
                "text": "Move one lower-ROI task later in the week to protect your highest-focus application window.",
            },
            "focusTip": str(
                (parsed or {}).get("focusTip")
                or "Protect your first high-focus block for the best application on your list."
            ),
        }

    def _build_insights_commentary_request(
        self,
        profile: dict[str, Any],
        metrics: dict[str, Any],
    ) -> dict[str, Any]:
        return {
            "system_prompt": (
                "You are OpportunIQ's economic impact analyst. "
                "Interpret the student's current pipeline and explain the main economic pattern, "
                "the most important bottleneck, and one strategic shift. Return JSON only."
            ),
            "user_payload": {
                "task": "Summarize opportunity economics and recommend a strategic shift.",
                "profile": profile,
                "metrics": metrics,
                "outputSchema": {
                    "summary": "string",
                    "reasoningBullets": ["string"],
                    "tradeoff": "string",
                    "whyNotNow": "string",
                    "nextStep": "string",
                    "economicImpact": "string",
                    "confidenceScore": 74,
                    "confidenceReason": "string",
                    "uncertainFields": ["string"],
                    "cards": [{"label": "string", "color": "text-green-600", "text": "string"}],
                    "strategy": {
                        "currentFocus": "string",
                        "suggestedFocus": "string",
                        "impactText": "string",
                    },
                    "economicImpactNarrative": "string",
                },
            },
            "max_tokens": 900,
            "reasoning_effort": "medium",
        }

    def insights_commentary(
        self,
        profile: dict[str, Any],
        metrics: dict[str, Any],
    ) -> dict[str, Any]:
        request = self._build_insights_commentary_request(profile, metrics)
        parsed = self._request_json("insights_commentary", request)
        pipeline_value = int(metrics.get("pipelineValue") or 0)
        expiring = int(metrics.get("valueAtRisk") or 0)
        fallback = self._general_contract(
            summary="Your current pipeline contains meaningful economic upside, but some of it is vulnerable to deadline and readiness friction.",
            reasoning_bullets=[
                "A useful share of your total accessible value is concentrated in a small number of top opportunities.",
                "The next gains will come from converting high-fit opportunities faster, not just discovering more listings.",
                "Readiness quality and deadline discipline are the main levers for improving capture.",
            ],
            tradeoff="Doubling down on short-term wins can improve near-term value capture, but it may slightly reduce long-term exploration time.",
            why_not_now="Some of the visible value is still not fully actionable because readiness and timing are uneven.",
            next_step="Protect expiring high-fit opportunities first, then rebalance into profile-building work.",
            economic_impact=(
                f"Current pipeline value is about {self._format_currency(pipeline_value)}, with roughly {self._format_currency(expiring)} at risk if near-term action slips."
            ),
            source="fallback",
            confidence_base=73,
            uncertain_fields=[],
        )
        normalized = self._normalize_general_contract(parsed, fallback, source="glm" if parsed else "fallback")
        return {
            **normalized,
            "cards": (parsed or {}).get("cards")
            or [
                {
                    "label": "Accessible upside",
                    "color": "text-green-600",
                    "text": f"About {self._format_currency(pipeline_value)} is currently within reach if the best opportunities are acted on in time.",
                },
                {
                    "label": "Expiring value",
                    "color": "text-orange-600",
                    "text": f"About {self._format_currency(expiring)} is most exposed to deadline slippage right now.",
                },
                {
                    "label": "Decision quality",
                    "color": "text-blue-600",
                    "text": "The biggest upside now comes from sharper prioritization, not more browsing.",
                },
            ],
            "strategy": (parsed or {}).get("strategy")
            or {
                "currentFocus": "The current pipeline mixes immediate wins with longer-horizon options.",
                "suggestedFocus": "Push more effort into high-fit opportunities that can convert in the next few weeks.",
                "impactText": "That should improve near-term economic capture without eliminating long-term upside.",
            },
            "economicImpactNarrative": str(
                (parsed or {}).get("economicImpactNarrative") or normalized["economicImpact"]
            ),
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
        behavior_signals = context.get("behaviorSignals", {})
        preferred_categories = behavior_signals.get("preferredCategories", [])

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

        def base_ai_fields(text: str, *, cited_ids: list[str], actions: list[str], prompts: list[str], uncertain: list[str] | None = None) -> dict[str, Any]:
            return {
                "response": text,
                "citedOpportunityIds": cited_ids,
                "recommendedActions": actions,
                "suggestedPrompts": prompts,
                "source": "fallback",
                "confidenceScore": 67 if cited_ids else 58,
                "confidenceReason": "The answer is grounded in current profile, opportunity, planner, and readiness context, but it is using deterministic fallback reasoning.",
                "uncertainFields": uncertain or [],
                "aiExplanation": self._general_contract(
                    summary=text.split("\n")[0],
                    reasoning_bullets=[
                        "The answer is grounded in your current shortlisted opportunities.",
                        "Readiness and planner state were used to keep the recommendation actionable.",
                        (
                            f"Recent behavior suggests stronger engagement with {preferred_categories[0]} opportunities."
                            if preferred_categories
                            else "Behavioral personalization is limited because engagement history is still light."
                        ),
                    ],
                    tradeoff="Fallback guidance is reliable and grounded, but less nuanced than a successful live GLM response.",
                    why_not_now="Some recommendations remain provisional until live reasoning succeeds or more profile detail is available.",
                    next_step=actions[0] if actions else "Choose one high-fit action and move it forward today.",
                    economic_impact=(
                        f"Prioritizing the right next step should help protect near-term opportunity value across {len(cited_ids) or len(top_opportunities)} relevant items."
                    ),
                    source="fallback",
                    confidence_base=66 if cited_ids else 58,
                    uncertain_fields=uncertain or [],
                ),
            }

        if any(token in question for token in ["priorit", "this week", "focus", "first"]):
            picks = top_by_stage()
            response = "Prioritize these opportunities this week:\n" + "\n".join(
                f"{index}. {self._opportunity_brief(item)}"
                for index, item in enumerate(picks, start=1)
            )
            if picks:
                response += f"\nStart with: {picks[0]['nextStep']}"
            return base_ai_fields(
                response,
                cited_ids=[item["id"] for item in picks],
                actions=[item["nextStep"] for item in picks[:3]],
                prompts=[
                    "Which one should I finish first today?",
                    "What is blocking my second-best option?",
                    "How should I split my next 7 days?",
                ],
            )

        if any(token in question for token in ["roi", "best return", "value", "highest return"]):
            picks = top_by_roi()
            response = "These look like your best ROI opportunities right now:\n" + "\n".join(
                f"{index}. {self._opportunity_brief(item)}"
                for index, item in enumerate(picks, start=1)
            )
            return base_ai_fields(
                response,
                cited_ids=[item["id"] for item in picks],
                actions=[item["nextStep"] for item in picks[:3]],
                prompts=[
                    "Which high-ROI option is easiest to finish quickly?",
                    "Compare my top internship and scholarship options",
                    "What am I missing for the best-paying option?",
                ],
            )

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
            return base_ai_fields(
                response,
                cited_ids=[item["id"] for item in picks],
                actions=[item["nextStep"] for item in picks[:3]]
                or [
                    "Strengthen your transcript, essay, and referee readiness.",
                    "Track higher-fit internships while building scholarship readiness.",
                ],
                prompts=[
                    "What is blocking my top scholarship option?",
                    "Which scholarship should I prepare for next?",
                    "How do I improve my scholarship readiness this month?",
                ],
                uncertain=["scholarship_competitiveness"] if not picks else [],
            )

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
            return base_ai_fields(
                " ".join(response_parts),
                cited_ids=[target["id"]] if target else [],
                actions=[f"Improve {item['title']}" for item in weak[:3]]
                or ["Close the top readiness gap before applying."],
                prompts=[
                    "Which missing asset matters most?",
                    "What can I fix in the next 3 days?",
                    "How much would my fit improve if I close these gaps?",
                ],
                uncertain=["unlock_delta"],
            )

        if any(token in question for token in ["plan", "7 days", "next week", "next 7", "schedule"]):
            tasks = planner_tasks[:5]
            response = "Here is a practical next-step plan for the coming week:\n" + "\n".join(
                f"{index}. {task['title']} ({task['dueLabel']}, {task['duration']})"
                for index, task in enumerate(tasks, start=1)
            )
            if planner.get("focusTip"):
                response += f"\nFocus tip: {planner['focusTip']}"
            return base_ai_fields(
                response,
                cited_ids=[
                    task["opportunityId"]
                    for task in tasks
                    if task.get("opportunityId")
                ],
                actions=[task["title"] for task in tasks[:3]],
                prompts=[
                    "What should I do first today?",
                    "Which task can I safely defer?",
                    "How can I improve my weekly focus score?",
                ],
            )

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
            if preferred_categories:
                response += f" Your recent behavior also suggests sustained interest in {preferred_categories[0]} opportunities."
            return base_ai_fields(
                response,
                cited_ids=[item["id"] for item in picks],
                actions=[item["nextStep"] for item in picks[:3]],
                prompts=[
                    "Which opportunity best fits my long-term goals?",
                    "Should I focus on internships or scholarships first?",
                    "What profile upgrade would change my top matches most?",
                ],
            )

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
        return base_ai_fields(
            response,
            cited_ids=[item["id"] for item in picks],
            actions=[item["nextStep"] for item in picks[:3]],
            prompts=[
                "Which opportunities should I prioritize this week?",
                "Show me high ROI opportunities",
                "What am I missing based on my profile?",
            ],
        )

    def _build_advisor_reply_request(
        self,
        profile: dict[str, Any],
        message: str,
        history: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        readiness = context.get("readiness", {})
        planner = context.get("planner", {})
        return {
            "system_prompt": (
                "You are OpportunIQ's AI advisor for university students. "
                "Local scoring has already identified candidate opportunities. "
                "Use the supplied profile, readiness, planner, behavior, and shortlist context to answer the student clearly. "
                "Keep the answer specific, comparative, and actionable. Return JSON only."
            ),
            "user_payload": {
                "task": "Answer the student's decision question using the provided context only.",
                "profile": profile,
                "message": message,
                "history": history[-4:],
                "context": {
                    "topOpportunities": context.get("topOpportunities", [])[:6],
                    "scholarshipOpportunities": context.get("scholarshipOpportunities", [])[:3],
                    "readiness": {
                        "overall": readiness.get("overall"),
                        "modules": readiness.get("modules", [])[:4],
                        "blockers": readiness.get("blockers", [])[:2],
                    },
                    "planner": {
                        "tasks": planner.get("tasks", [])[:4],
                        "categories": planner.get("categories", []),
                        "focusScore": planner.get("focusScore"),
                        "totalEstimatedTimeHours": planner.get("totalEstimatedTimeHours"),
                    },
                    "behaviorSignals": context.get("behaviorSignals", {}),
                },
                "timestamp": datetime.now(UTC).isoformat(),
                "outputSchema": {
                    "response": "string",
                    "summary": "string",
                    "reasoningBullets": ["string"],
                    "tradeoff": "string",
                    "whyNotNow": "string",
                    "nextStep": "string",
                    "economicImpact": "string",
                    "confidenceScore": 74,
                    "confidenceReason": "string",
                    "uncertainFields": ["string"],
                    "citedOpportunityIds": ["string"],
                    "recommendedActions": ["string"],
                    "suggestedPrompts": ["string"],
                },
            },
            "max_tokens": 700,
            "reasoning_effort": "low",
        }

    def advisor_reply(
        self,
        profile: dict[str, Any],
        message: str,
        history: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        request = self._build_advisor_reply_request(profile, message, history, context)
        parsed = self._request_json("advisor_reply", request)
        if parsed and parsed.get("response"):
            fallback_contract = self._general_contract(
                summary=str(parsed.get("summary") or parsed["response"]),
                reasoning_bullets=self._coerce_string_list(parsed.get("reasoningBullets"))
                or [
                    "The answer is grounded in your active shortlist and current profile context.",
                    "Readiness and planner state were used to keep the recommendation actionable.",
                    "The recommendation prioritizes decisions over general exploration.",
                ],
                tradeoff=str(parsed.get("tradeoff") or "Some lower-priority options were intentionally deprioritized."),
                why_not_now=str(parsed.get("whyNotNow") or "Not every visible option is worth equal attention right now."),
                next_step=str(
                    parsed.get("nextStep")
                    or (self._coerce_string_list(parsed.get("recommendedActions"))[:1] or ["Take the top recommended action first."])[0]
                ),
                economic_impact=str(
                    parsed.get("economicImpact")
                    or "Prioritizing the right next step should improve economic capture across the strongest current opportunities."
                ),
                source="glm",
                confidence_base=int(parsed.get("confidenceScore") or 78),
                uncertain_fields=self._coerce_string_list(parsed.get("uncertainFields")),
            )
            normalized = self._normalize_general_contract(parsed, fallback_contract, source="glm")
            return {
                "response": parsed["response"],
                "citedOpportunityIds": self._coerce_string_list(parsed.get("citedOpportunityIds")),
                "recommendedActions": self._coerce_string_list(parsed.get("recommendedActions")),
                "suggestedPrompts": self._coerce_string_list(parsed.get("suggestedPrompts")),
                "source": "glm",
                "confidenceScore": normalized["confidenceScore"],
                "confidenceReason": normalized["confidenceReason"],
                "uncertainFields": normalized["uncertainFields"],
                "aiExplanation": normalized,
            }

        return self._advisor_fallback(message, profile, context)
