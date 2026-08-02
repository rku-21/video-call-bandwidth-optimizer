from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import joblib

from ml_service.policy import AdaptivePolicy, HeuristicPolicy
from ml_service.schemas import EncodingHint, RecommendRequest


@dataclass
class ModelPolicy(AdaptivePolicy):
    model_path: Path
    name: str = "sklearn-model"

    def __post_init__(self) -> None:
        self._model = None
        self.reload()

    def reload(self) -> None:
        if self.model_path.exists():
            self._model = joblib.load(self.model_path)
            
            if isinstance(self._model, dict) and "model" in self._model:
                meta = self._model
                self._model = meta["model"]
                self.name = str(meta.get("name") or self.name)
        else:
            self._model = None

    def recommend(self, req: RecommendRequest) -> EncodingHint:
        
        if self._model is None:
            return HeuristicPolicy().recommend(req)

        s = req.stats
        x = [
            float(s.available_outgoing_bitrate_bps or 0.0),
            float(s.rtt_ms or 0.0),
            float(s.packet_loss_pct or 0.0),
            float(s.frames_per_second or 0.0),
            float(s.frames_dropped or 0.0),
            float(s.send_bitrate_bps or 0.0),
            float(req.importance_score or 0.0),
        ]

        y = self._model.predict([x])[0]

        
        bitrate = int(max(150_000, min(6_000_000, float(y[0]))))
        fps = int(max(5, min(60, round(float(y[1])))))
        scale = float(max(1.0, min(4.0, float(y[2]))))

        return EncodingHint(
            suggested_max_bitrate_bps=bitrate,
            suggested_fps=fps,
            suggested_scale_down_by=scale,
        )
