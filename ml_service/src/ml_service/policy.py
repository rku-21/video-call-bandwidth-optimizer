from __future__ import annotations
from dataclasses import dataclass
from ml_service.schemas import EncodingHint, RecommendRequest


class AdaptivePolicy:
    name: str

    def recommend(self, req: RecommendRequest) -> EncodingHint:
        raise NotImplementedError


@dataclass(frozen=True)
class HeuristicPolicy(AdaptivePolicy):
   

    name: str = "heuristic-v1"

    def recommend(self, req: RecommendRequest) -> EncodingHint:
        stats = req.stats
        importance = float(req.importance_score or 0.0)

        bw_bps = (
            stats.available_outgoing_bitrate_bps if stats.available_outgoing_bitrate_bps is not None
            else (stats.send_bitrate_bps if stats.send_bitrate_bps is not None else 1200000.0) # 1.2Mbps 
        )

        
        bw_kbps = max(0.0, bw_bps / 1000.0)
        base_bps = int(max(150000, min(5000000, bw_bps * 0.85))) #make base_bps b/w (0.15Mbps, 5Mbps)

       
        boost = 0.80 + 0.50 * importance  
        target_bps = int(max(150_000, min(6_000_000, base_bps * boost))) #make target_bps b/w (0.15Mbps,6Mbps)

        loss = stats.packet_loss_pct
        if loss is not None:
            if loss > 8:
                target_bps = int(target_bps * 0.65)
            elif loss > 4:
                target_bps = int(target_bps * 0.8)

        
        rtt = stats.rtt_ms
        if rtt is not None and rtt > 250:
            target_bps = int(target_bps * 0.85)

        if bw_kbps < 350:
            scale = 2.0
            fps = 12
        elif bw_kbps < 700:
            scale = 1.5
            fps = 15
        elif bw_kbps < 1300:
            scale = 1.0
            fps = 24
        else:
            scale = 1.0
            fps = 30

        # If importance is high in poor bandwidth preserve resolution drop fps.
        if importance > 0.8 and bw_kbps < 700:
            scale = 1.0
            fps = 12

        return EncodingHint(
            suggested_max_bitrate_bps=target_bps,
            suggested_scale_down_by=scale,
            suggested_fps=fps,
        )
