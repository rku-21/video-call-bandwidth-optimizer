import {useEffect } from "react";
import {Home} from "./pages/home";
import { useSocket } from "./useSocket";
import { useCallReconnection } from "./reconnection/useCallReconnection";
import { useCallBindings } from "./store/initializeCallStore";
import { useVideoElements } from "./store/initializeVideoElement";
import { useAdaptiveCalling } from "./adaptive/useAdaptiveCalling";
import { isMlServiceConfigured } from "./adaptive/mlClient";

export default function App() {
  useSocket();
  useCallReconnection();

  const {
    initCallStore,
    roomId,
    setRoomId,
    error,
    callActive,
    createRoom,
    joinRoom,
    leaveRoom,
    intent,
    remoteConnected,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    adaptiveMode,
    setAdaptiveMode,
    adaptiveSnapshot,
    setAdaptiveSnapshot,
  } =
    useCallBindings();

  const {
    localVideoRef,
    remoteVideoRef,
    ensureLocalMedia,
    attachLocalStream,
    attachRemoteStream,
    startCallOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setAudioEnabled,
    setVideoEnabled,
    resetPeerConnection,
    stopPeer,
    clearRemoteVideo,
    randomRoomId,
    getPeerConnection,
  } =
    useVideoElements();

  const envAdaptiveEnabled = String(import.meta.env.VITE_ADAPTIVE_CALLING ?? "1").trim() !== "0";
  const adaptiveEnabled = callActive && envAdaptiveEnabled && adaptiveMode !== "off";
  const mlConfigured = isMlServiceConfigured();

  useAdaptiveCalling(
    adaptiveEnabled,
    adaptiveMode === "off" ? "auto" : adaptiveMode,
    getPeerConnection,
    setAdaptiveSnapshot
  );

  useEffect(() => {
    initCallStore({
      ensureLocalMedia,
      attachLocalStream,
      attachRemoteStream,
      getPeerConnection,
      startCallOffer,
      handleOffer,
      handleAnswer,
      handleIceCandidate,
      setAudioEnabled,
      setVideoEnabled,
      resetPeerConnection,
      stopPeer,
      clearRemoteVideo,
      randomRoomId,
    });
  }, [
    initCallStore,
    ensureLocalMedia,
    attachLocalStream,
    attachRemoteStream,
    getPeerConnection,
    startCallOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setAudioEnabled,
    setVideoEnabled,
    resetPeerConnection,
    stopPeer,
    clearRemoteVideo,
    randomRoomId,
  ]);

  useEffect(() => {
    if (!callActive) return;
    // Call UI mounts the <video> elements; attach any already-captured streams.
    attachLocalStream();
    attachRemoteStream();
  }, [callActive, attachLocalStream, attachRemoteStream]);

  return (
    <>
      <Home
        roomId={roomId}
        setRoomId={setRoomId}
        error={error}
        callActive={callActive}
        createRoom={createRoom}
        joinRoom={joinRoom}
        leaveRoom={leaveRoom}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        remoteConnected={remoteConnected}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        adaptiveMode={adaptiveMode}
        setAdaptiveMode={setAdaptiveMode}
        mlConfigured={mlConfigured}
        adaptiveSnapshot={adaptiveSnapshot}
      />
    </>
  )
}
   