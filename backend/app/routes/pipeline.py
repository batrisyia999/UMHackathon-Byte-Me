from fastapi import APIRouter

from app.services import get_container

router = APIRouter(tags=["pipeline"])


@router.get("/pipeline")
def get_pipeline() -> dict:
    return get_container().screens.get_pipeline()
