import type { RefObject } from "react";

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
}: HomeProps)=> {

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