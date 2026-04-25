from fastapi import APIRouter

from app.models import ProfileUpdateRequest
from app.services import get_container

router = APIRouter(tags=["profile"])


@router.get("/profile")
def get_profile() -> dict:
    return get_container().screens.get_profile()


@router.put("/profile")
def update_profile(payload: ProfileUpdateRequest) -> dict:
    return get_container().screens.update_profile(payload.model_dump(exclude_none=True))
