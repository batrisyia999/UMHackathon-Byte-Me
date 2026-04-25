from fastapi import APIRouter, HTTPException, Query

from app.services import get_container

router = APIRouter(tags=["resources"])


@router.get("/resources")
def get_resources(search: str | None = Query(default=None)) -> dict:
    return get_container().screens.get_resources(search=search)


@router.post("/resources/{resource_id}/download")
def download_resource(resource_id: str) -> dict:
    resource = get_container().screens.download_resource(resource_id)
    if resource is None:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.post("/resources/webinars/{webinar_id}/register")
def register_webinar(webinar_id: str) -> dict:
    webinar = get_container().screens.register_webinar(webinar_id)
    if webinar is None:
        raise HTTPException(status_code=404, detail="Webinar not found")
    return webinar
