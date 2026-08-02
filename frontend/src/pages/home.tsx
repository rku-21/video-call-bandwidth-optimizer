import type { RefObject } from "react";
import type { AdaptiveSnapshot } from "../adaptive/types";

type HomeProps = {
  roomId: string;
  setRoomId: (value: string) => void;
  error: string;
  callActive: boolean;
  createRoom: () => void | Promise<void>;
  joinRoom: () => void | Promise<void>;
  leaveRoom: () => void;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  remoteVideoRef: RefObject<HTMLVideoElement | null>;
  remoteConnected: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  toggleAudio: () => void | Promise<void>;
  toggleVideo: () => void | Promise<void>;

  adaptiveMode: "off" | "auto" | "heuristic" | "ml";
  setAdaptiveMode: (mode: "off" | "auto" | "heuristic" | "ml") => void;
  mlConfigured: boolean;
  adaptiveSnapshot: AdaptiveSnapshot | null;
};

export const Home=({
  roomId,
  setRoomId,
  error,
  callActive,
  createRoom,
  joinRoom,
  leaveRoom,
  localVideoRef,
  remoteVideoRef,
  remoteConnected,
  audioEnabled,
  videoEnabled,
  toggleAudio,
  toggleVideo,
  adaptiveMode,
  setAdaptiveMode,
  mlConfigured,
  adaptiveSnapshot,
}: HomeProps)=> {
  const fmtBps = (bps?: number | null): string => {
    if (!bps || !Number.isFinite(bps)) return "-";
    if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mbps`;
    if (bps >= 1_000) return `${Math.round(bps / 1_000)} kbps`;
    return `${Math.round(bps)} bps`;
  };

  const fmtNum = (n?: number | null, digits = 0): string => {
    if (n === null || n === undefined || !Number.isFinite(n)) return "-";
    return n.toFixed(digits);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {!callActive ? (
          <>
            {/* Header Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
                Adaptive real-time video calling
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Create a new room or join an existing one to start calling
              </p>
            </div>

            {/* Setup Card */}
            <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
              {/* Room ID Input */}
              <div className="mb-6">
                <label 
                  htmlFor="roomId" 
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide"
                >
                  Room ID
                </label>
                <input
                  id="roomId"
                  type="text"
                  value={roomId}
                  placeholder="Enter room ID"
                  onChange={(e) => {
                    setRoomId(e.target.value);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    error
                      ? "border-2 border-red-500 dark:border-red-400"
                      : "border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none`}
                />
                {error && (
                  <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={createRoom}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>+</span>
                  <span>Create room</span>
                </button>
                <button
                  type="button"
                  onClick={joinRoom}
                  disabled={!roomId.trim()}
                  className={`px-4 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    roomId.trim()
                      ? "bg-green-600 hover:bg-green-700 active:scale-95 text-white cursor-pointer"
                      : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-60"
                  }`}
                >
                  <span>→</span>
                  <span>Join room</span>
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 rounded-lg p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold">💡 Tip:</span> Create a room to generate a unique ID, then share it with others to join your call.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Call Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  Room {roomId}
                </h2>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse" />
                  Call active
                </p>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-widest">
                    Adaptive mode
                  </label>
                  <select
                    value={adaptiveMode}
                    onChange={(e) => {
                      const v = e.target.value as "off" | "auto" | "heuristic" | "ml";
                      setAdaptiveMode(v);
                    }}
                    className="px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="off">Off</option>
                    <option value="auto">Auto (recommended)</option>
                    <option value="heuristic">Heuristic (local)</option>
                    <option value="ml" disabled={!mlConfigured}>
                      ML service
                    </option>
                  </select>

                  {!mlConfigured && (
                    <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      ML mode needs <span className="font-mono">VITE_ML_SERVICE_URL</span>.
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={leaveRoom}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <span>⏏</span>
                <span>Leave room</span>
              </button>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Local Video */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="relative w-full bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                  />
                  <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    You (local)
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={toggleAudio}
                      className="bg-black/70 hover:bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                      title={audioEnabled ? "Mute" : "Unmute"}
                    >
                      {audioEnabled ? "Mute" : "Unmute"}
                    </button>
                    <button
                      type="button"
                      onClick={toggleVideo}
                      className="bg-black/70 hover:bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                      title={videoEnabled ? "Camera off" : "Camera on"}
                    >
                      {videoEnabled ? "Camera off" : "Camera on"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remote Video */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="relative w-full bg-black aspect-video flex items-center justify-center">
                  <video
                    ref={remoteVideoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                  <div className="absolute bottom-4 left-4 bg-black/70 text-slate-300 px-3 py-2 rounded-lg text-sm font-semibold">
                    Remote participant
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  Live adaptive stats
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {adaptiveSnapshot
                    ? `updated ${Math.max(0, Math.round((Date.now() - adaptiveSnapshot.timestampMs) / 1000))}s ago`
                    : "-"}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">mode:</span> {adaptiveMode}
                  {adaptiveMode === "auto" ? (
                    <>
                      <span className="text-slate-500 dark:text-slate-400"> · using:</span> {adaptiveSnapshot?.providerUsed ?? "-"}
                    </>
                  ) : null}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">policy:</span> {adaptiveSnapshot?.policyName ?? "-"}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">importance (ROI):</span> {fmtNum(adaptiveSnapshot?.importanceScoreUsed, 2)}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">send bitrate:</span> {fmtBps(adaptiveSnapshot?.stats?.sendBitrateBps)}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">available bitrate:</span> {fmtBps(adaptiveSnapshot?.stats?.availableOutgoingBitrateBps)}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">rtt:</span> {fmtNum(adaptiveSnapshot?.stats?.rttMs)} ms
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">loss:</span> {fmtNum(adaptiveSnapshot?.stats?.packetLossPct, 2)}%
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">fps:</span> {fmtNum(adaptiveSnapshot?.stats?.framesPerSecond, 1)}
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">dropped:</span> {fmtNum(adaptiveSnapshot?.stats?.framesDropped)}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">hint:</span> maxBitrate {fmtBps(adaptiveSnapshot?.hint?.suggested_max_bitrate_bps)} · fps {fmtNum(adaptiveSnapshot?.hint?.suggested_fps, 0)} · scale {fmtNum(adaptiveSnapshot?.hint?.suggested_scale_down_by, 2)}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 dark:text-slate-400">apply:</span>{" "}
                  {adaptiveSnapshot?.applied?.attempted ? "attempted" : "idle"} · {adaptiveSnapshot?.applied?.ok ? "ok" : "error"}
                  {adaptiveSnapshot?.applied?.error ? (
                    <span className="ml-2 text-xs font-semibold text-red-600 dark:text-red-400">{adaptiveSnapshot.applied.error}</span>
                  ) : null}
                </div>
              </div>

              {!mlConfigured && (
                <p className="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  ML mode is disabled because <span className="font-mono">VITE_ML_SERVICE_URL</span> is not set.
                  If you start with <span className="font-mono">./run_all.ps1</span>, it is set automatically.
                </p>
              )}
            </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-widest">
                  Share this room ID
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={roomId}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white font-mono font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(roomId);
                    }}
                    className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-colors duration-200 font-semibold text-lg"
                    title="Copy room ID"
                  >
                    📋
                  </button>
                </div>
              </div>
           
          </>
        )}
      </div>
    </div>
  );
}