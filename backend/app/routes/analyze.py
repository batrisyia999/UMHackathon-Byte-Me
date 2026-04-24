from fastapi import APIRouter
from app.services.ai_service import analyze_with_glm
from app.services.opportunity_service import OpportunityService
from app.models import StudentProfile

router = APIRouter()

@router.post("/analyze")
def analyze(data: dict):

    profile = data.get("profile", {})

    required = ["course", "cgpa", "interests"]

    for field in required:
        if not profile.get(field):
            return {
                "error": f"Missing required field: {field}"
            }
        

    profile = {
        "name": data.get("name"),
        "course": data.get("course"),
        "faculty": data.get("faculty"),
        "year": data.get("year"),
        "cgpa": data.get("cgpa"),
        "interests": data.get("interests"),
        "goals": data.get("goals"),
        "time_availability": data.get("time_availability"),
        "readiness_level": data.get("readiness_level"),
        "assets": data.get("assets")
    }

    # IMPORTANT: normalize opportunities into list format
    opportunities = data.get("opportunities", [])

    return analyze_with_glm({
        "profile": profile,
        "opportunities": opportunities
    })