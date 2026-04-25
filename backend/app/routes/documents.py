from fastapi import APIRouter, HTTPException

from app.models import CreateDocumentRequest, UpdateDocumentRequest
from app.services import get_container

router = APIRouter(tags=["documents"])


@router.get("/documents")
def list_documents() -> dict:
    return get_container().screens.get_documents()


@router.post("/documents")
def create_document(payload: CreateDocumentRequest) -> dict:
    return get_container().screens.create_document(payload.model_dump())


@router.patch("/documents/{document_id}")
def update_document(document_id: str, payload: UpdateDocumentRequest) -> dict:
    updated = get_container().screens.update_document(
        document_id,
        payload.model_dump(exclude_none=True),
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return updated


@router.delete("/documents/{document_id}")
def delete_document(document_id: str) -> dict:
    deleted = get_container().screens.delete_document(document_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"id": document_id, "deleted": True}
