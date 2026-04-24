from fastapi import APIRouter

from app.services import get_container

router = APIRouter(tags=["readiness"])


@router.get("/readiness")
def get_readiness() -> dict:
    return get_container().screens.get_readiness()
