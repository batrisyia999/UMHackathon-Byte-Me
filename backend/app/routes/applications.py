from fastapi import APIRouter, HTTPException

from app.models import CreateApplicationRequest, UpdateApplicationRequest
from app.services import get_container

router = APIRouter(tags=["applications"])


@router.get("/applications")
def list_applications() -> dict:
    return get_container().screens.get_applications()


@router.post("/applications")
def create_application(payload: CreateApplicationRequest) -> dict:
    application = get_container().screens.create_application(payload.opportunityId)
    if application is None:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return application


@router.patch("/applications/{application_id}")
def update_application(application_id: str, payload: UpdateApplicationRequest) -> dict:
    application = get_container().screens.update_application(
        application_id,
        payload.model_dump(exclude_none=True),
    )
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application
