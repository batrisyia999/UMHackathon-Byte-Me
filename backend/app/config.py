from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel, Field
from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env")


class Settings(BaseModel):
    appName: str = "OpportunIQ API"
    apiPrefix: str = "/api"
    dataDir: Path = Field(
        default_factory=lambda: Path(
            os.getenv(
                "OPPORTUNIQ_DATA_DIR",
                Path(__file__).resolve().parents[1] / "data",
            )
        )
    )
    zAiApiKey: str | None = Field(
        default_factory=lambda: os.getenv("ILMU_API_KEY")
        or os.getenv("ZAI_API_KEY")
        or os.getenv("GLM_API_KEY")
    )
    zAiBaseUrl: str = Field(
        default_factory=lambda: os.getenv(
            "ILMU_API_BASE_URL",
            os.getenv("ZAI_API_BASE_URL", "https://api.ilmu.ai/v1"),
        ).rstrip("/")
    )
    zAiModel: str = Field(
        default_factory=lambda: os.getenv(
            "ILMU_MODEL",
            os.getenv("ZAI_MODEL", "ilmu-glm-5.1"),
        )
    )
    zAiFallbackModel: str = Field(
        default_factory=lambda: os.getenv("ILMU_FALLBACK_MODEL")
        or os.getenv("ZAI_FALLBACK_MODEL")
        or os.getenv("GLM_FALLBACK_MODEL")
        or "ilmu-glm-5.1"
    )
    zAiTimeoutSeconds: int = Field(
        default_factory=lambda: int(os.getenv("ILMU_TIMEOUT_SECONDS", os.getenv("ZAI_TIMEOUT_SECONDS", "30")))
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
