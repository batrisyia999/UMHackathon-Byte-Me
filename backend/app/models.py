from pydantic import BaseModel
from typing import List, Optional, Union

class StudentProfile(BaseModel):
    name: str
    course: str
    faculty: str
    year: int
    cgpa: float
    interests: List[str]
    goals: List[str]
    time_availability: str  # e.g., "5 hours/week"
    readiness_level: str  # e.g., "Ready", "Preparing"
    assets: List[str]  # e.g., ["CV", "Transcript", "LinkedIn"]

class Opportunity(BaseModel):
    id: str
    title: str
    category: str
    description: str
    eligibility: str
    deadline: Optional[str] = None
    estimated_value: Optional[float] = None
    value_currency: str
    target_disciplines: List[str]
    target_year: List[int]
    study_level: List[str]
    application_effort: str
    required_documents: Optional[List[str]] = None
    source_credibility: str
    opportunity_link: str
    tags: List[str]

class OpportunityRecommendation(BaseModel):
    opportunity: Opportunity
    fit_score: int
    urgency_score: int
    estimated_economic_value: float
    effort_level: str
    eligibility_confidence: str
    recommended_action: str
    reasoning: str
    risk_factor: Optional[str]
    next_steps: List[str]
