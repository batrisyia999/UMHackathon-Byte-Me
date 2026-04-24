from fastapi import APIRouter, HTTPException

from app.services import get_container

router = APIRouter(tags=["planner"])


@router.get("/planner")
def get_planner() -> dict:
    return get_container().screens.get_planner()


@router.post("/planner/tasks/{task_id}/toggle")
def toggle_planner_task(task_id: str) -> dict:
    task = get_container().screens.toggle_planner_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="Planner task not found")
    return task


@router.post("/planner/optimize")
def optimize_planner() -> dict:
    return get_container().screens.optimize_planner()
