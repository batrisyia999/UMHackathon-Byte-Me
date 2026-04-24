from fastapi import APIRouter, HTTPException, Query

from app.models import SaveOpportunityRequest
from app.services import get_container

router = APIRouter(tags=["opportunities"])


@router.get("/opportunities")
def list_opportunities(
    category: str | None = Query(default=None),
    stage: str | None = Query(default=None),
    sort: str = Query(default="best-match"),
    search: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> dict:
    return get_container().screens.get_opportunities(
        category=category,
        stage=stage,
        sort=sort,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/opportunities/{opportunity_id}")
def get_opportunity_detail(opportunity_id: str) -> dict:
    detail = get_container().screens.get_opportunity_detail(opportunity_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return detail


@router.post("/opportunities/{opportunity_id}/save")
def save_opportunity(opportunity_id: str, payload: SaveOpportunityRequest) -> dict:
    return get_container().screens.save_opportunity(opportunity_id, payload.saved)
