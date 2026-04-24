from fastapi import APIRouter

from app.services import get_container

router = APIRouter(tags=["network"])


@router.get("/network")
def get_network() -> dict:
    return get_container().screens.get_network()
