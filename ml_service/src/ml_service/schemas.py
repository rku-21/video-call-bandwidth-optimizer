from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field


class WebRtcStats(BaseModel):
    available_outgoing_bitrate_bps: float | None = Field(
        default=None,
        ge=0,
        description="From WebRTC candidate-pair.availableOutgoingBitrate", # if available 
    )
    
    rtt_ms: float | None =Field(default=None, ge=0)
    
    packet_loss_pct: float|None = Field(default=None,ge=0,le=100)
    frames_per_second: float| None = Field(default=None, ge=0)
    frames_dropped: int|None = Field(default=None, ge=0)
    send_bitrate_bps: float| None = Field(default=None, ge=0)


class RecommendRequest(BaseModel):
    mode: Literal["webrtc"] = "webrtc"
    stats: WebRtcStats
    #optional 
    importance_score: float = Field(default=0.0, ge=0, le=1)


class EncodingHint(BaseModel):
    mode: Literal["webrtc"] = "webrtc"
    suggested_max_bitrate_bps: int = Field(ge=10000)
    suggested_scale_down_by: float = Field(ge=1.0, le=4.0)
    suggested_fps: int = Field(ge=5, le=60)


class RecommendResponse(BaseModel):
    encoding_hint: EncodingHint
    policy_name: str
