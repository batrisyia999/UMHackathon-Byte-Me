from fastapi import APIRouter

from app.models import HealthResponse
from app.services import get_container

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse.model_validate(get_container().screens.health())
