import { heuristicRecommend } from "./policy";
import {isMlServiceConfigured,recommendFromMlService,sendTelemetryToMlService,} from "./mlClient";
import type { AdaptiveSnapshot, EncodingHint } from "./types";
import { getWebRtcStats, type StatsAccumulator } from "./webrtcStats";

type ControllerOptions = {
  intervalMs?: number;
  importanceScore?: number;
  providerMode?: "auto" | "heuristic" | "ml";
  onSnapshot?: (snapshot: AdaptiveSnapshot) => void;
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function computeAutoImportance(stats: { availableOutgoingBitrateBps?: number; sendBitrateBps?: number; rttMs?: number; packetLossPct?: number }, base: number): number {
  let imp = clamp01(base);
  const bw = stats.availableOutgoingBitrateBps ?? stats.sendBitrateBps;
  if (bw != null) {
    if (bw < 400_000) imp *= 0.35;
    else if (bw < 800_000) imp *= 0.65;
  }

  const loss = stats.packetLossPct;
  if (loss != null) {
    if (loss > 8) imp *= 0.4;
    else if (loss > 4) imp *= 0.7;
  }

  const rtt = stats.rttMs;
  if (rtt != null) {
    if (rtt > 400) imp *= 0.65;
    else if (rtt > 250) imp *= 0.85;
  }

  return clamp01(imp);
}

function shouldUpdate(prev: EncodingHint | null, next: EncodingHint): boolean {
  if (!prev) return true;

  const bitrateDelta = Math.abs(next.suggested_max_bitrate_bps - prev.suggested_max_bitrate_bps);
  const bitratePct = bitrateDelta / Math.max(1, prev.suggested_max_bitrate_bps);
  if (bitrateDelta > 50_000 && bitratePct > 0.1) return true;

  if (Math.abs(next.suggested_fps - prev.suggested_fps) >= 3) return true;
  if (Math.abs(next.suggested_scale_down_by - prev.suggested_scale_down_by) >= 0.25) return true;

  return false;
}

async function trySetParameters(sender: RTCRtpSender, enc: RTCRtpEncodingParameters): Promise<void> {
  const params = sender.getParameters();
  if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
  params.encodings[0] = { ...(params.encodings[0] ?? {}), ...enc };
  await sender.setParameters(params);
}

async function applyHintToSenderResilient(sender: RTCRtpSender, hint: EncodingHint): Promise<void> {
  
  try {
    await trySetParameters(sender, {
      maxBitrate: hint.suggested_max_bitrate_bps,
      maxFramerate: hint.suggested_fps,
      scaleResolutionDownBy: hint.suggested_scale_down_by,
    });
    return;
  } catch {}

  
  try {
    await trySetParameters(sender, {
      maxBitrate: hint.suggested_max_bitrate_bps,
      maxFramerate: hint.suggested_fps,
    });
    return;
  } catch {}

  await trySetParameters(sender, {
    maxBitrate: hint.suggested_max_bitrate_bps,
  });
}

export function startAdaptiveController(
  getPeerConnection: () => RTCPeerConnection | null,
  opts: ControllerOptions = {}
): { stop: () => void } {
  const intervalMs = opts.intervalMs ?? 1000;
  const importanceScore = opts.importanceScore ?? 0.6;
  const providerMode = opts.providerMode ?? "auto";
  const onSnapshot = opts.onSnapshot;

  let timer: number | null = null;
  let stopped = false;
  let lastHint: EncodingHint | null = null;
  let lastAppliedOk = true;
  let lastAppliedError: string | undefined;
  const acc: StatsAccumulator = {};

  const tick = async () => {
    if (stopped) return;

    const pc = getPeerConnection();
    if (!pc || pc.connectionState === "closed") return;

    try {
      const stats = await getWebRtcStats(pc, acc);

      const importanceScoreUsed = providerMode === "auto" ? computeAutoImportance(stats, importanceScore) : clamp01(importanceScore);

      let hint: EncodingHint;
      let policyName = "local-heuristic";
      let providerUsed: "heuristic" | "ml" = "heuristic";

      if (providerMode === "heuristic") {
        hint = heuristicRecommend(stats, importanceScoreUsed);
        policyName = "local-heuristic";
        providerUsed = "heuristic";
      } else if (providerMode === "ml") {
        try {
          const res = await recommendFromMlService(stats, importanceScoreUsed);
          hint = res.encoding_hint;
          policyName = res.policy_name;
          providerUsed = "ml";
        } catch {
          hint = heuristicRecommend(stats, importanceScoreUsed);
          policyName = "ml-failed-fallback";
          providerUsed = "heuristic";
        }
      } else {
        
        if (isMlServiceConfigured()) {
          try {
            const res = await recommendFromMlService(stats, importanceScoreUsed);
            hint = res.encoding_hint;
            policyName = res.policy_name;
            providerUsed = "ml";
          } catch {
            hint = heuristicRecommend(stats, importanceScoreUsed);
            policyName = "fallback-heuristic";
            providerUsed = "heuristic";
          }
        } else {
          hint = heuristicRecommend(stats, importanceScoreUsed);
          policyName = "local-heuristic";
          providerUsed = "heuristic";
        }
      }

      const senders = pc.getSenders();
      const videoSenders = senders.filter((s) => s.track?.kind === "video");

      const shouldApply = videoSenders.length > 0 && shouldUpdate(lastHint, hint);
      let attempted = false;

      if (shouldApply) {
        attempted = true;
        let appliedOk = true;
        let appliedError: string | undefined;
        for (const sender of videoSenders) {
          try {
            await applyHintToSenderResilient(sender, hint);
          } catch (e) {
            appliedOk = false;
            appliedError = (e as Error)?.message || String(e);
          }
        }

        lastHint = hint;
        lastAppliedOk = appliedOk;
        lastAppliedError = appliedError;

          //  Storing the real telemetry data to retrain the model 
          void sendTelemetryToMlService({  
            timestampMs: Date.now(),
            stats,
            appliedHint: hint,
            importanceScore: importanceScoreUsed,
            policyName,
          }).catch(() => undefined);
        
      }

      const snapshot: AdaptiveSnapshot = {
        timestampMs: Date.now(),
        providerMode,
        providerUsed,
        policyName,
        importanceScoreUsed,
        stats,
        hint,
        applied: attempted
          ? lastAppliedOk
            ? { attempted: true, ok: true }
            : { attempted: true, ok: false, error: lastAppliedError }
          : { attempted: false, ok: lastAppliedOk, error: lastAppliedError },
      };
      onSnapshot?.(snapshot);
    } catch (e) {
      
      console.warn("Adaptive controller tick failed:", e);
    }
  };

  const stop = () => {
    stopped = true;
    if (timer != null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  timer = window.setInterval(() => {
    void tick();
  }, intervalMs);

  
  void tick();

  return { stop };
}

