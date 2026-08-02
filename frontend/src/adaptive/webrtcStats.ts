import type { WebRtcStats } from "./types";

export type StatsAccumulator = {
  lastBytesSent?: number;
  lastTimestampMs?: number;
};

function asNumber(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function findSelectedCandidatePair(report: RTCStatsReport): any | undefined {
  let best: any | undefined;
  for (const s of report.values()) {
    if (s.type !== "candidate-pair") continue;
    if (s.state && s.state !== "succeeded") continue;

    
    const nominated = Boolean((s as any).nominated);
    const selected = Boolean((s as any).selected);

    if (nominated || selected) return s;
    if (!best) best = s;
  }
  return best;
}

function findOutboundVideo(report: RTCStatsReport): any | undefined {
  for (const s of report.values()) {
    if (s.type !== "outbound-rtp") continue;
    if ((s as any).kind === "video" || (s as any).mediaType === "video") return s;
  }
  return undefined;
}

function computeLossPct(report: RTCStatsReport, outbound: any | undefined): number | undefined {
 
  const localId = outbound?.id as string | undefined;
  if (localId) {
    for (const s of report.values()) {
      if (s.type !== "remote-inbound-rtp") continue;
      if ((s as any).kind !== "video" && (s as any).mediaType !== "video") continue;
      if ((s as any).localId !== localId) continue;

      const lost = asNumber((s as any).packetsLost);
      const received = asNumber((s as any).packetsReceived);
      if (lost == null || received == null) return undefined;
      const total = lost + received;
      if (total <= 0) return undefined;
      return (lost / total) * 100;
    }
  }

  return undefined;
}

export async function getWebRtcStats(pc: RTCPeerConnection, acc: StatsAccumulator): Promise<WebRtcStats> {
  const report = await pc.getStats();

  const pair = findSelectedCandidatePair(report);
  const outbound = findOutboundVideo(report);

  const availableOutgoingBitrateBps = asNumber((pair as any)?.availableOutgoingBitrate);
  const rttSeconds = asNumber((pair as any)?.currentRoundTripTime) ?? asNumber((pair as any)?.roundTripTime);
  const rttMs = rttSeconds != null ? rttSeconds * 1000 : undefined;

  const bytesSent = asNumber((outbound as any)?.bytesSent);
  const nowMs = Date.now();

  let sendBitrateBps: number | undefined;
  if (bytesSent != null && acc.lastBytesSent != null && acc.lastTimestampMs != null) {
    const deltaBytes = bytesSent - acc.lastBytesSent;
    const deltaSec = (nowMs - acc.lastTimestampMs) / 1000;
    if (deltaSec > 0.2 && deltaBytes >= 0) {
      sendBitrateBps = (deltaBytes * 8) / deltaSec;
    }
  }

  acc.lastBytesSent = bytesSent ?? acc.lastBytesSent;
  acc.lastTimestampMs = nowMs;

  const framesPerSecond = asNumber((outbound as any)?.framesPerSecond);
  const framesDropped = asNumber((outbound as any)?.framesDropped) ?? asNumber((outbound as any)?.framesDiscarded);

  const packetLossPct = computeLossPct(report, outbound);

  return {
    availableOutgoingBitrateBps,
    rttMs,
    packetLossPct,
    framesPerSecond,
    framesDropped: framesDropped != null ? Math.round(framesDropped) : undefined,
    sendBitrateBps,
  };
}
