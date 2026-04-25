from fastapi import APIRouter

from app.models import (
    ExportResponse,
    FeedbackRequest,
    UpdateAISettingsRequest,
    UpdateAccountRequest,
    UpdatePreferencesRequest,
    UpdatePrivacySettingsRequest,
    UpdateRegionSettingsRequest,
)
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


@router.put("/settings/notifications")
def update_notifications(payload: UpdatePreferencesRequest) -> dict:
    preferences = [item.model_dump(mode="json") for item in payload.preferences]
    return get_container().screens.update_preferences(preferences)


@router.put("/settings/ai-preferences")
def update_ai_preferences(payload: UpdateAISettingsRequest) -> dict:
    return get_container().screens.update_ai_preferences(payload.model_dump(exclude_none=True))


@router.put("/settings/region")
def update_region(payload: UpdateRegionSettingsRequest) -> dict:
    return get_container().screens.update_region_settings(payload.model_dump(exclude_none=True))


@router.put("/settings/privacy")
def update_privacy(payload: UpdatePrivacySettingsRequest) -> dict:
    return get_container().screens.update_privacy_settings(payload.model_dump(exclude_none=True))


@router.post("/settings/export", response_model=ExportResponse)
def export_data() -> ExportResponse:
    return ExportResponse.model_validate(get_container().screens.export_data())


@router.post("/settings/deactivate")
def deactivate_account() -> dict:
    return get_container().screens.deactivate_account()


@router.post("/settings/delete")
def delete_account() -> dict:
    return get_container().screens.delete_account()


@router.post("/settings/history/clear")
def clear_history() -> dict:
    return get_container().screens.clear_history()


@router.post("/settings/feedback")
def submit_feedback(payload: FeedbackRequest) -> dict:
    return get_container().screens.submit_feedback(payload.message)
