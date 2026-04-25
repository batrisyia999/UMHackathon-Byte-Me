from __future__ import annotations

from functools import lru_cache

from app.models import OpportunitySeed
from app.services.state_store import JsonStateStore


class CatalogService:
    def __init__(self, store: JsonStateStore):
        self.store = store

    @lru_cache(maxsize=1)
    def list_opportunities(self) -> list[OpportunitySeed]:
        return self.store.load_model(
            self.store.catalogPath(),
            list[OpportunitySeed],
            default=[],
        )

    def refresh(self) -> list[OpportunitySeed]:
        self.list_opportunities.cache_clear()
        return self.list_opportunities()

    def get_opportunity(self, opportunity_id: str) -> OpportunitySeed | None:
        for opportunity in self.list_opportunities():
            if opportunity.id == opportunity_id:
                return opportunity
        return None
