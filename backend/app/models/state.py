from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


OpportunityCategory = Literal[
    "Internship",
    "Scholarship",
    "Competition",
    "Grant",
    "Certification",
    "Programme",
]
EffortLevel = Literal["Low", "Medium", "High"]
EligibilityLevel = Literal["Low", "Medium", "High"]
PipelineStage = Literal["apply-now", "prepare-soon", "track-later", "skip"]
ReadinessStatus = Literal["complete", "warning", "critical"]


class GoalProgressState(BaseModel):
    label: str
    progress: int


class AssetState(BaseModel):
    id: str
    label: str
    completion: int
    status: str
    filename: str | None = None
    link: str | None = None
    category: str | None = None


class ProfileState(BaseModel):
    id: str
    name: str
    firstName: str
    avatar: str
    email: str
    phone: str
    university: str
    course: str
    faculty: str
    year: int
    studyLevel: Literal["Undergraduate", "Postgraduate"]
    cgpaMin: float
    cgpaMax: float
    cgpaLabel: str
    goal: str
    timeAvailability: str
    readinessLevel: Literal["Just Exploring", "Actively Preparing", "Ready to Apply"]
    skills: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    goalsProgress: list[GoalProgressState] = Field(default_factory=list)
    assets: list[AssetState] = Field(default_factory=list)
    savedOpportunityIds: list[str] = Field(default_factory=list)


class OpportunitySeed(BaseModel):
    id: str
    title: str
    company: str
    category: OpportunityCategory
    description: str
    eligibility: str
    deadline: str | None = None
    estimatedValueRaw: float | None = None
    estimatedValueLabel: str
    valueCurrency: str = "RM"
    targetDisciplines: list[str] = Field(default_factory=list)
    targetYear: list[int] = Field(default_factory=list)
    studyLevel: list[str] = Field(default_factory=list)
    applicationEffort: EffortLevel
    requiredDocuments: list[str] = Field(default_factory=list)
    sourceCredibility: str = "High"
    opportunityLink: str
    tags: list[str] = Field(default_factory=list)
    strategicValue: int = 60
    location: str | None = None
    type: str | None = None
    logo: str | None = None
    verified: bool = True
    tag: str | None = None
    topPick: bool = False


class ApplicationState(BaseModel):
    id: str
    opportunityId: str
    title: str
    company: str
    status: str
    submittedDate: str
    deadline: str
    stage: str
    progress: int
    interviewDate: str | None = None


class DocumentState(BaseModel):
    id: str
    title: str
    category: str
    size: str
    uploadDate: str
    status: Literal["ready", "needs-update", "missing"]
    usedIn: int = 0
    path: str | None = None


class PlannerTaskState(BaseModel):
    id: str
    title: str
    subtitle: str = ""
    dueLabel: str
    dueDate: str | None = None
    time: str | None = None
    duration: str
    durationMinutes: int = 0
    completed: bool = False
    opportunityId: str | None = None
    type: PipelineStage | Literal["break"] = "track-later"


class PreferenceState(BaseModel):
    title: str
    description: str
    enabled: bool


class ConnectionState(BaseModel):
    id: str
    name: str
    role: str
    company: str
    type: str
    date: str
    mutual: int
    expertise: list[str] = Field(default_factory=list)


class SuggestedConnectionState(BaseModel):
    id: str
    name: str
    role: str
    company: str
    mutual: int


class ResourceItemState(BaseModel):
    id: str
    title: str
    type: Literal["guide", "video", "template", "webinar"]
    description: str
    duration: str
    rating: float
    downloads: int


class WebinarItemState(BaseModel):
    id: str
    title: str
    date: str
    time: str


class ResourceState(BaseModel):
    resources: list[ResourceItemState] = Field(default_factory=list)
    webinars: list[WebinarItemState] = Field(default_factory=list)


class AdvisorMessageState(BaseModel):
    id: int
    role: Literal["user", "assistant"]
    content: str
    time: str
