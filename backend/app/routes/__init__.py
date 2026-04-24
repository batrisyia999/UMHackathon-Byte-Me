from fastapi import APIRouter

from app.routes import advisor, applications, calendar, dashboard, documents, health
from app.routes import insights, network, opportunities, pipeline, planner, profile
from app.routes import readiness, resources, settings

router = APIRouter()
router.include_router(health.router)
router.include_router(profile.router)
router.include_router(dashboard.router)
router.include_router(opportunities.router)
router.include_router(pipeline.router)
router.include_router(readiness.router)
router.include_router(planner.router)
router.include_router(insights.router)
router.include_router(advisor.router)
router.include_router(applications.router)
router.include_router(calendar.router)
router.include_router(documents.router)
router.include_router(network.router)
router.include_router(resources.router)
router.include_router(settings.router)

__all__ = ["router"]
