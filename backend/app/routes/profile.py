from fastapi import APIRouter
from app.services.ai_service import analyze_with_glm

router = APIRouter()

@router.post("/profile")
def save_profile(profile: dict):
    return {"status": "profile received", "data": profile}