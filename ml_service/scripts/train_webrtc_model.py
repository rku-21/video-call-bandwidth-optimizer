from __future__ import annotations
import json
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = REPO_ROOT / "ml_service" / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))



import joblib
import numpy as np
from sklearn.compose import TransformedTargetRegressor
from sklearn.linear_model import Ridge
from sklearn.multioutput import MultiOutputRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


def loadData(path: Path) -> list[dict]:
    rows: list[dict] = []
    if not path.exists():
        return rows
    with path.open("r", encoding="utf-8") as f: 
        for line in f:
            line = line.strip()
            if not line:
                continue
            rows.append(json.loads(line))
    return rows


def features(event: dict) -> list[float]:
    s = event.get("stats") or {}
    return [
        float(s.get("available_outgoing_bitrate_bps") or 0.0),
        float(s.get("rtt_ms") or 0.0),
        float(s.get("packet_loss_pct") or 0.0),
        float(s.get("frames_per_second") or 0.0),
        float(s.get("frames_dropped") or 0.0),
        float(s.get("send_bitrate_bps") or 0.0),
        float(event.get("importance_score") or 0.0),
    ]


def label(event: dict) -> list[float]:
    h = event.get("applied_hint") or {}
    return [
        float(h.get("suggested_max_bitrate_bps") or 0.0),
        float(h.get("suggested_fps") or 0.0),
        float(h.get("suggested_scale_down_by") or 1.0),
    ]


def main() -> None:
    artifacts = Path("ml_service") / "artifacts"
    telemetryPath= artifacts / "telemetry.jsonl"
    seedPath= artifacts / "seed_telemetry.jsonl"

    rows = loadData(telemetryPath)
    if len(rows) < 200:
        rows = loadData(seedPath) 

    X = np.asarray([features(r) for r in rows], dtype=np.float32)
    y = np.asarray([label(r) for r in rows], dtype=np.float32)

    model = Pipeline(steps=[("scaler", StandardScaler()),("reg",MultiOutputRegressor(TransformedTargetRegressor( regressor=Ridge(alpha=2.0),transformer=None,)),),])

    model.fit(X, y)

    out_path = artifacts / "webrtc_model.joblib"
    artifacts.mkdir(parents=True, exist_ok=True)

    payload = {
        "name": "ridge-multioutput-v1",
        "model": model,
        "n_samples": int(X.shape[0]),
        "feature_order": [
            "available_outgoing_bitrate_bps",
            "rtt_ms",
            "packet_loss_pct",
            "frames_per_second",
            "frames_dropped",
            "send_bitrate_bps",
            "importance_score",
        ],
        "label_order": ["bitrate_bps", "fps", "scale"],
    }

    joblib.dump(payload, out_path)
    print("trained on", X.shape[0], "samples")
    print("saved model to", out_path)


if __name__ == "__main__":
    main()
