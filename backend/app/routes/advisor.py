from fastapi import APIRouter

from app.models import AdvisorChatRequest
from app.services import get_container

router = APIRouter(tags=["advisor"])


@router.get("/advisor/bootstrap")
def advisor_bootstrap() -> dict:
    return get_container().screens.get_advisor_bootstrap()


@router.post("/advisor/chat")
def advisor_chat(payload: AdvisorChatRequest) -> dict:
    history = [item.model_dump(mode="json") for item in payload.history]
    return get_container().screens.advisor_chat(payload.message, history)
