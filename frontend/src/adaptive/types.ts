export type WebRtcStats = {
  availableOutgoingBitrateBps?: number;
  rttMs?: number;
  packetLossPct?: number;
  framesPerSecond?: number;
  framesDropped?: number;
  sendBitrateBps?: number;
};

export type RecommendRequest = {
  mode: "webrtc";
  stats: {
    available_outgoing_bitrate_bps?: number;
    rtt_ms?: number;
    packet_loss_pct?: number;
    frames_per_second?: number;
    frames_dropped?: number;
    send_bitrate_bps?: number;
  };
  importance_score?: number;  // for now keeping it optional 
};

export type EncodingHint = {
  mode: "webrtc";
  suggested_max_bitrate_bps: number;
  suggested_scale_down_by: number;
  suggested_fps: number;
};

export type RecommendResponse = {
  encoding_hint: EncodingHint;
  policy_name: string;
};


   // to show on the ui 
export type AdaptiveSnapshot = {
  timestampMs: number;
  providerMode: "auto" | "heuristic" | "ml";
  providerUsed: "heuristic" | "ml";
  policyName: string;
  importanceScoreUsed: number;   
  stats: WebRtcStats;
  hint: EncodingHint;
  applied: {
    attempted: boolean;
    ok: boolean;
    error?: string;
  };
};
