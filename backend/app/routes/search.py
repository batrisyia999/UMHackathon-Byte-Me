from fastapi import APIRouter, Query

from app.services import get_container

router = APIRouter(tags=["search"])


@router.get("/search")
def search(q: str | None = Query(default=None)) -> dict:
    return get_container().screens.search(q)
