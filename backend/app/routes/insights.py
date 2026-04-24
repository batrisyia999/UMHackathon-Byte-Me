from fastapi import APIRouter

from app.services import get_container

router = APIRouter(tags=["insights"])


@router.get("/insights")
def get_insights() -> dict:
    return get_container().screens.get_insights()
