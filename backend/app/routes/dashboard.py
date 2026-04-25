from fastapi import APIRouter

from app.services import get_container

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def dashboard() -> dict:
    return get_container().screens.get_dashboard()
