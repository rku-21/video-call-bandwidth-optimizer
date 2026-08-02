import type { EncodingHint, WebRtcStats } from "./types";

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function heuristicRecommend(stats: WebRtcStats, importanceScore = 0): EncodingHint {
  const importance = importanceScore;

  const bwBps =
    stats.availableOutgoingBitrateBps ?? stats.sendBitrateBps ?? 1_200_000;

  const bwKbps = Math.max(0, bwBps / 1000);

  const baseBps = clamp(bwBps * 0.85, 150_000, 5_000_000);
  const boost = 0.8 + 0.5 * importance; 
  let targetBps = clamp(baseBps * boost, 150_000, 6_000_000);

  const loss = stats.packetLossPct;
  if (loss != null) {
    if (loss > 8) targetBps *= 0.65;
    else if (loss > 4) targetBps *= 0.8;
  }

  const rtt = stats.rttMs;
  if (rtt != null && rtt > 250) targetBps *= 0.85;

  let scale = 1.0;
  let fps = 30;

  if (bwKbps < 350) {
    scale = 2.0;
    fps = 12;
  } else if (bwKbps < 700) {
    scale = 1.5;
    fps = 15;
  } else if (bwKbps < 1300) {
    scale = 1.0;
    fps = 24;
  }

  if (importance > 0.8 && bwKbps < 700) {
    scale = 1.0;
    fps = 12;
  }

  return {
    mode: "webrtc",
    suggested_max_bitrate_bps: Math.round(clamp(targetBps, 150_000, 6_000_000)),
    suggested_scale_down_by: scale,
    suggested_fps: fps,
  };
}
