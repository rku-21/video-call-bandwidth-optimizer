import {useEffect, useRef } from "react";
import {Home} from "./pages/home";
import { useSocket } from "./useSocket";
import { useCallBindings } from "./store/initializeCallStore";
import { useVideoElements } from "./store/initializeVideoElement";

export default function App() {
  useSocket();

  const { initCallStore, roomId, setRoomId, error, callActive, createRoom, joinRoom, leaveRoom,intent } =
    useCallBindings();

  const { localVideoRef, remoteVideoRef, ensureLocalMedia, stopPeer, clearRemoteVideo, randomRoomId } =
    useVideoElements();

  useEffect(() => {
    initCallStore({
      ensureLocalMedia,
      stopPeer,
      clearRemoteVideo,
      randomRoomId,
    });
  }, [initCallStore, ensureLocalMedia, stopPeer, clearRemoteVideo, randomRoomId]);

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
      />
    </>
  )
}
   