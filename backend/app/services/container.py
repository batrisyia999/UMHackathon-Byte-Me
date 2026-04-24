from __future__ import annotations

from functools import lru_cache

from app.config import get_settings
from app.services.catalog_service import CatalogService
from app.services.glm_service import GLMService
from app.services.scoring_service import ScoringService
from app.services.screen_service import ScreenService
from app.services.state_store import JsonStateStore


class ServiceContainer:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self.store = JsonStateStore(settings)
        self.catalog = CatalogService(self.store)
        self.scoring = ScoringService()
        self.glm = GLMService(settings, self.store)
        self.screens = ScreenService(
            settings=settings,
            store=self.store,
            catalog=self.catalog,
            scoring=self.scoring,
            glm=self.glm,
        )


@lru_cache(maxsize=1)
def get_container() -> ServiceContainer:
    return ServiceContainer()
