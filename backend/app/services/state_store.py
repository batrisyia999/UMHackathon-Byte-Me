from __future__ import annotations

import json
from pathlib import Path
from typing import Any, TypeVar

from pydantic import BaseModel, TypeAdapter

from app.config import Settings

T = TypeVar("T")


class JsonStateStore:
    def __init__(self, settings: Settings):
        self.dataDir = settings.dataDir
        self.stateDir = self.dataDir / "state"
        self.dataDir.mkdir(parents=True, exist_ok=True)
        self.stateDir.mkdir(parents=True, exist_ok=True)

    def catalogPath(self) -> Path:
        return self.dataDir / "opportunities.json"

    def statePath(self, filename: str) -> Path:
        return self.stateDir / filename

    def load_json(self, path: Path, default: Any) -> Any:
        if not path.exists():
            self.save_json(path, default)
            return default
        with path.open("r", encoding="utf-8") as file:
            return json.load(file)

    def save_json(self, path: Path, payload: Any) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        temp_path = path.with_suffix(path.suffix + ".tmp")
        with temp_path.open("w", encoding="utf-8") as file:
            json.dump(payload, file, ensure_ascii=True, indent=2)
        temp_path.replace(path)

    def load_model(self, path: Path, model_type: type[T], default: Any) -> T:
        payload = self.load_json(path, default)
        return TypeAdapter(model_type).validate_python(payload)

    def save_model(self, path: Path, model: BaseModel | list[BaseModel] | dict[str, Any]) -> None:
        if isinstance(model, BaseModel):
            payload = model.model_dump(mode="json")
        elif isinstance(model, list) and model and isinstance(model[0], BaseModel):
            payload = [item.model_dump(mode="json") for item in model]
        else:
            payload = model
        self.save_json(path, payload)
