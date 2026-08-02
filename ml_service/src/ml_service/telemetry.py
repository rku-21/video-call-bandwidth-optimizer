from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from ml_service.schemas import EncodingHint, WebRtcStats


class TelemetryEvent(BaseModel):
    mode: Literal["webrtc"] = "webrtc"
    timestamp_ms: int = Field(ge=0)
    stats: WebRtcStats
    applied_hint: EncodingHint
    importance_score: float = Field(default=0.0, ge=0, le=1)
    policy_name: str | None = None


def append_jsonl(path: Path, event: BaseModel) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(event.model_dump(mode="json"), ensure_ascii=False))
        f.write("\n")
