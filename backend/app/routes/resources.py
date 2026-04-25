from fastapi import APIRouter, Query

from app.services import get_container

router = APIRouter(tags=["resources"])


@router.get("/resources")
def get_resources(search: str | None = Query(default=None)) -> dict:
    return get_container().screens.get_resources(search=search)
