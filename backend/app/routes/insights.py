from fastapi import APIRouter

from app.models import ExportResponse
from app.services import get_container

router = APIRouter(tags=["insights"])


@router.get("/insights")
def get_insights() -> dict:
    return get_container().screens.get_insights()


@router.post("/insights/export", response_model=ExportResponse)
def export_insights() -> ExportResponse:
    return ExportResponse.model_validate(get_container().screens.export_insights_report())
