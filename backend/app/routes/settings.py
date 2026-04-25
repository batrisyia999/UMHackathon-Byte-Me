from fastapi import APIRouter

from app.models import ExportResponse, UpdateAccountRequest, UpdatePreferencesRequest
from app.services import get_container

router = APIRouter(tags=["settings"])


@router.get("/settings")
def get_settings() -> dict:
    return get_container().screens.get_settings()


@router.put("/settings/account")
def update_account(payload: UpdateAccountRequest) -> dict:
    return get_container().screens.update_account(payload.model_dump(exclude_none=True))


@router.put("/settings/preferences")
def update_preferences(payload: UpdatePreferencesRequest) -> dict:
    preferences = [item.model_dump(mode="json") for item in payload.preferences]
    return get_container().screens.update_preferences(preferences)


@router.post("/settings/export", response_model=ExportResponse)
def export_data() -> ExportResponse:
    return ExportResponse.model_validate(get_container().screens.export_data())


@router.post("/settings/deactivate")
def deactivate_account() -> dict:
    return get_container().screens.deactivate_account()


@router.post("/settings/delete")
def delete_account() -> dict:
    return get_container().screens.delete_account()
