from fastapi import APIRouter

from app.services import get_container

router = APIRouter(tags=["calendar"])


@router.get("/calendar")
def get_calendar() -> dict:
    return get_container().screens.get_calendar()
