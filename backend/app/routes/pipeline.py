from fastapi import APIRouter, HTTPException

from app.models import PipelineStageUpdateRequest
from app.services import get_container

router = APIRouter(tags=["pipeline"])


@router.get("/pipeline")
def get_pipeline() -> dict:
    return get_container().screens.get_pipeline()


@router.patch("/pipeline/{opportunity_id}")
def move_pipeline_stage(opportunity_id: str, payload: PipelineStageUpdateRequest) -> dict:
    moved = get_container().screens.move_pipeline_stage(opportunity_id, payload.stage)
    if moved is None:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return moved
