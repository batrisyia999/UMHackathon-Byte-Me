from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


AIResponseSource = Literal["glm", "fallback"]


class SharedAIContract(BaseModel):
    summary: str = ""
    reasoningBullets: list[str] = Field(default_factory=list)
    tradeoff: str = ""
    whyNotNow: str = ""
    nextStep: str = ""
    economicImpact: str = ""
    confidenceScore: int = 0
    confidenceReason: str = ""
    uncertainFields: list[str] = Field(default_factory=list)
    source: AIResponseSource = "fallback"


class PromptModeStats(BaseModel):
    calls: int = 0
    cacheHits: int = 0
    cacheMisses: int = 0
    liveSuccesses: int = 0
    liveFailures: int = 0
    fallbacks: int = 0
    malformedResponses: int = 0
    emptyResponses: int = 0
    avgLatencyMs: float = 0.0


class AIObservabilityStats(BaseModel):
    cacheHits: int = 0
    cacheMisses: int = 0
    liveSuccesses: int = 0
    liveFailures: int = 0
    malformedResponses: int = 0
    emptyResponses: int = 0
    byPromptMode: dict[str, PromptModeStats] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: Literal["ok"]
    appName: str
    glmConfigured: bool
    model: str
    seedCounts: dict[str, int]
    aiStats: AIObservabilityStats | None = None


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    fullName: str | None = None
    firstName: str | None = None
    avatar: str | None = None
    email: str | None = None
    phone: str | None = None
    university: str | None = None
    course: str | None = None
    faculty: str | None = None
    year: int | None = None
    studyLevel: str | None = None
    cgpaMin: float | None = None
    cgpaMax: float | None = None
    cgpaLabel: str | None = None
    goal: str | None = None
    timeAvailability: str | None = None
    readinessLevel: str | None = None
    skills: list[str] | None = None
    interests: list[str] | None = None


class SaveOpportunityRequest(BaseModel):
    saved: bool | None = None


class AdvisorChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AdvisorChatRequest(BaseModel):
    message: str
    history: list[AdvisorChatHistoryItem] = Field(default_factory=list)


class CreateApplicationRequest(BaseModel):
    opportunityId: str


class UpdateApplicationRequest(BaseModel):
    status: str | None = None
    submittedDate: str | None = None
    deadline: str | None = None
    stage: str | None = None
    progress: int | None = None
    interviewDate: str | None = None


class CreateDocumentRequest(BaseModel):
    title: str
    category: str
    size: str = "0 KB"
    uploadDate: str | None = None
    status: str = "ready"
    path: str | None = None


class UpdateDocumentRequest(BaseModel):
    title: str | None = None
    category: str | None = None
    size: str | None = None
    uploadDate: str | None = None
    status: str | None = None
    usedIn: int | None = None
    path: str | None = None


class UpdateAccountRequest(BaseModel):
    name: str | None = None
    fullName: str | None = None
    firstName: str | None = None
    email: str | None = None
    phone: str | None = None
    university: str | None = None
    avatar: str | None = None


class PreferenceUpdate(BaseModel):
    title: str
    enabled: bool


class UpdatePreferencesRequest(BaseModel):
    preferences: list[PreferenceUpdate]


class UpdateAISettingsRequest(BaseModel):
    proactiveSuggestions: bool | None = None
    contextAwareness: str | None = None
    responseStyle: str | None = None
    dataUsageForTraining: bool | None = None


class UpdateRegionSettingsRequest(BaseModel):
    language: str | None = None
    timezone: str | None = None
    dateFormat: str | None = None


class UpdatePrivacySettingsRequest(BaseModel):
    profileVisibility: str | None = None
    showUniversity: bool | None = None
    analyticsEnabled: bool | None = None
    thirdPartySharing: bool | None = None


class FeedbackRequest(BaseModel):
    message: str


class PipelineStageUpdateRequest(BaseModel):
    stage: Literal["apply-now", "prepare-soon", "track-later", "skip"]


class CreatePlannerTaskRequest(BaseModel):
    title: str
    subtitle: str = ""
    dueLabel: str = "Today"
    dueDate: str | None = None
    time: str | None = None
    duration: str = "30min"
    durationMinutes: int | None = None
    type: Literal["apply-now", "prepare-soon", "track-later", "skip", "break"] = "apply-now"
    opportunityId: str | None = None


class ConnectionMessageRequest(BaseModel):
    message: str


class ExportResponse(BaseModel):
    message: str
    generatedAt: str
    exportPath: str
    sections: dict[str, Any]
