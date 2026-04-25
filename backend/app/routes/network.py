from fastapi import APIRouter, HTTPException

from app.models import ConnectionMessageRequest
from app.services import get_container

router = APIRouter(tags=["network"])


@router.get("/network")
def get_network() -> dict:
    return get_container().screens.get_network()


@router.post("/network/suggested/{connection_id}/connect")
def connect_suggested_connection(connection_id: str) -> dict:
    connection = get_container().screens.connect_suggested_connection(connection_id)
    if connection is None:
        raise HTTPException(status_code=404, detail="Suggested connection not found")
    return connection


@router.post("/network/connections/{connection_id}/message")
def message_connection(connection_id: str, payload: ConnectionMessageRequest) -> dict:
    connection = get_container().screens.message_connection(connection_id, payload.message)
    if connection is None:
        raise HTTPException(status_code=404, detail="Connection not found")
    return connection
