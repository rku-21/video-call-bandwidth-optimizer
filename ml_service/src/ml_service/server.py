from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml_service.model_policy import ModelPolicy
from ml_service.policy import HeuristicPolicy
from ml_service.schemas import RecommendRequest, RecommendResponse
from ml_service.telemetry import TelemetryEvent, append_jsonl


app = FastAPI(
    title="Adaptive Calling ML Service", 
    version="0.1.0"
    )


cors_env = os.getenv(
    "ML_SERVICE_CORS_ALLOW_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173"
    )

cors_origin = [o.strip() for o in cors_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origin if "*" not in cors_origin else ["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"],
)

artifact_default = Path("ml_service") / "artifacts" / "webrtc_model.joblib"

model_path = Path(os.getenv("ML_SERVICE_MODEL_PATH", str(artifact_default)))
telemetry_path = Path(os.getenv("ML_SERVICE_TELEMETRY_PATH", str(Path("ml_service") / "artifacts" / "telemetry.jsonl")))

heuristic = HeuristicPolicy()
model_policy = ModelPolicy(model_path=model_path, name="sklearn-model")


def _active_policy_name() -> str:
    return model_policy.name if model_policy._model is not None else heuristic.name



@app.post("/v1/recommend/webrtc", response_model=RecommendResponse)
def recommend_webrtc(req: RecommendRequest) -> RecommendResponse:
   
    if model_policy._model is not None:
        hint = model_policy.recommend(req)
        name = model_policy.name
    else:
        hint = heuristic.recommend(req)
        name = heuristic.name

    return RecommendResponse(encoding_hint=hint, policy_name=name)


@app.post("/v1/telemetry/webrtc")
def ingest_telemetry(ev: TelemetryEvent) -> dict:
    append_jsonl(telemetry_path, ev)
    return {"ok": True}


@app.post("/v1/admin/model/reload")
def reload_model() -> dict:
    model_policy.reload()
    return {"ok": True, "policy": _active_policy_name(), "model_loaded": model_policy._model is not None}

@app.get("/health")
def Health()->dict:
    return {
        "ok": True,
        "policy": _active_policy_name(),
        "model_loaded": model_policy._model is not None,
        "model_path": str(model_path),
    }
