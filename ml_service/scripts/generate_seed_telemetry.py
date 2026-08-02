from __future__ import annotations
import json
import random
import time
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[2]

SRC_DIR = REPO_ROOT / "ml_service" / "src" #SRC_DIR is path object

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))



from ml_service.policy import HeuristicPolicy
from ml_service.schemas import RecommendRequest, WebRtcStats


def sample_stats() -> WebRtcStats:
   
    rtt_ms = max(0.0, random.gauss(120, 80))
    packet_loss_pct = max(0.0, min(15.0, random.random() ** 2 * 12.0))

    
    available_bps = max(50_000.0, min(6_000_000.0, random.lognormvariate(13.0, 0.7)))

    fps = max(0.0, min(60.0, random.gauss(25, 8)))
    dropped = int(max(0.0, random.gauss(2, 6)))

    
    send_bps = max(10_000.0, min(6_000_000.0, available_bps * random.uniform(0.4, 0.95)))

    return WebRtcStats(
        available_outgoing_bitrate_bps=available_bps,
        rtt_ms=rtt_ms,
        packet_loss_pct=packet_loss_pct,
        frames_per_second=fps,
        frames_dropped=dropped,
        send_bitrate_bps=send_bps,
    )


def main() -> None:
    out_path = Path("ml_service") / "artifacts" / "seed_telemetry.jsonl"
    out_path.parent.mkdir(parents=True, exist_ok=True)

    policy = HeuristicPolicy() 

    n = 5000
    now = int(time.time() * 1000)

    with out_path.open("w", encoding="utf-8") as f:
        for i in range(n):
            stats = sample_stats()
            importance = random.random() ** 1.5   #optinal 
            req = RecommendRequest(stats=stats, importance_score=importance)
            hint = policy.recommend(req)

            ev = {
                "mode": "webrtc",
                "timestamp_ms": now + i * 1000,
                "stats": stats.model_dump(mode="json"),
                "applied_hint": hint.model_dump(mode="json"),
                "importance_score": importance,
                "policy_name": policy.name,
            }

            f.write(json.dumps(ev, ensure_ascii=False))
            f.write("\n")

    print("written ", n, " events to", out_path)


if __name__ == "__main__":
    main()
