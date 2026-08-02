import type { RecommendRequest, RecommendResponse, WebRtcStats } from "./types";

const URL = (import.meta.env.VITE_ML_SERVICE_URL as string | undefined)?.trim();


export function isMlServiceConfigured(): boolean {
  return Boolean(URL);
}



export async function recommendFromMlService(stats: WebRtcStats, importanceScore = 0): Promise<RecommendResponse> {
  if (!URL) throw new Error("url is not avialable");

  const body: RecommendRequest = {
    mode: "webrtc",
    stats: {
      available_outgoing_bitrate_bps: stats.availableOutgoingBitrateBps,
      rtt_ms: stats.rttMs,
      packet_loss_pct: stats.packetLossPct,
      frames_per_second: stats.framesPerSecond,
      frames_dropped: stats.framesDropped,
      send_bitrate_bps: stats.sendBitrateBps,
    },
    importance_score: importanceScore,
  };

  const res = await fetch(`${URL.replace(/\/$/, "")}/v1/recommend/webrtc`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ML service error: ${res.status} ${text}`);
  }

  return (await res.json()) as RecommendResponse;
}

export async function sendTelemetryToMlService(args: {
  timestampMs: number;
  stats: WebRtcStats;
  appliedHint: RecommendResponse["encoding_hint"];
  importanceScore?: number;
  policyName?: string;
}): Promise<void> {
  if (!URL) return;
  

  const body = {
    mode: "webrtc",
    timestamp_ms: args.timestampMs,
    stats: {
      available_outgoing_bitrate_bps: args.stats.availableOutgoingBitrateBps,
      rtt_ms: args.stats.rttMs,
      packet_loss_pct: args.stats.packetLossPct,
      frames_per_second: args.stats.framesPerSecond,
      frames_dropped: args.stats.framesDropped,
      send_bitrate_bps: args.stats.sendBitrateBps,
    },
    applied_hint: args.appliedHint,
    importance_score: args.importanceScore ?? 0,
    policy_name: args.policyName,
  };

  await fetch(`${URL.replace(/\/$/, "")}/v1/telemetry/webrtc`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then(() => undefined);
}
