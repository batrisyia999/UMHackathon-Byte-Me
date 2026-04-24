from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: Literal["ok"]
    appName: str
    glmConfigured: bool
    model: str
    seedCounts: dict[str, int]


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
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


class ExportResponse(BaseModel):
    message: str
    generatedAt: str
    exportPath: str
    sections: dict[str, Any]
