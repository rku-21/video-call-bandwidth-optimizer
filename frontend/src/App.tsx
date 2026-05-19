import {useEffect } from "react";
import {Home} from "./pages/home";
import { useSocket } from "./useSocket";
import { useCallReconnection } from "./reconnection/useCallReconnection";
import { useCallBindings } from "./store/initializeCallStore";
import { useVideoElements } from "./store/initializeVideoElement";

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
  } =
    useVideoElements();

  useEffect(() => {
    initCallStore({
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
    });
  }, [
    initCallStore,
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
      />
    </>
  )
}
   