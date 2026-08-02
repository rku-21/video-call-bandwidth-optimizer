import { useEffect, useRef } from "react";
import { startAdaptiveController } from "./controller";
import type { AdaptiveSnapshot } from "./types";

export type AdaptiveMode = "off" | "auto" | "heuristic" | "ml";

export function useAdaptiveCalling(
  enabled: boolean,
  mode: Exclude<AdaptiveMode, "off">,
  getPeerConnection: () => RTCPeerConnection | null,
  onSnapshot?: (snapshot: AdaptiveSnapshot) => void
): void {
  const stopRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    if (!enabled) return;
    const { stop } = startAdaptiveController(getPeerConnection, {
      intervalMs: 1000,
      importanceScore: 0,
      providerMode: mode,
      onSnapshot,
    });
    stopRef.current = stop;

    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
  }, [enabled, mode, getPeerConnection, onSnapshot]);
}
