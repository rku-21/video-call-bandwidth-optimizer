import { useEffect } from "react";
import { socket } from "./socket";
import { useCallStore } from "./store/useCallStore";

export function useSocket(): void {
  const intent = useCallStore((s) => s.socketIntent);
  const clearSocketIntent = useCallStore((s) => s.clearSocketIntent);

  useEffect(() => {
    const onConnect = () => {
      };

    const onDisconnect = () => {
    };

    const onRoomCreated = (roomId: string) => {
      useCallStore.setState({ currentRoomId: roomId });
    };

    const onRoomJoined = (roomId: string) => {
      useCallStore.setState({ currentRoomId: roomId });
    };

    const onRoomLeft = (roomId: string) => {
      const { currentRoomId } = useCallStore.getState();
      if (currentRoomId === roomId) useCallStore.setState({ currentRoomId: "" });
    };

    const onUserJoined = async () => {
      const { deps, currentRoomId } = useCallStore.getState();
      if (!deps || !currentRoomId) return;
      try {
        useCallStore.setState({remoteConnected:true});
        deps.resetPeerConnection();
        await deps.startCallOffer(currentRoomId);
      } catch (e) {
        // Keep UI alive; surface error in store.
        useCallStore.setState({ error: (e as Error)?.message || String(e) });
      }
    };

    const onUserDisconnected = () => {
      const { deps } = useCallStore.getState();
      if (!deps) return;
      deps.resetPeerConnection();
      deps.clearRemoteVideo();
      useCallStore.getState().setRemoteConnected(false);
    };

    const onOffer = async ({ offer }: { offer: RTCSessionDescriptionInit; senderSocketId: string }) => {
      const { deps, currentRoomId } = useCallStore.getState();
      if (!deps || !currentRoomId) return;
      try {
        useCallStore.setState({remoteConnected:true});
        await deps.handleOffer(currentRoomId, offer);
      } catch (e) {
        useCallStore.setState({ error: (e as Error)?.message || String(e) });
      }
    };

    const onAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit; senderSocketId: string }) => {
      const { deps } = useCallStore.getState();
      if (!deps) return;
      try {
        useCallStore.setState({remoteConnected:true});
        await deps.handleAnswer(answer);
      } catch (e) {
        useCallStore.setState({ error: (e as Error)?.message || String(e) });
      }
    };

    const onIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit; senderSocketId: string }) => {
      const { deps } = useCallStore.getState();
      if (!deps) return;
      await deps.handleIceCandidate(candidate);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room-created", onRoomCreated);
    socket.on("room-joined", onRoomJoined);
    socket.on("room-left", onRoomLeft);
    socket.on("user-joined", onUserJoined);
    socket.on("user-disconnected", onUserDisconnected);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIceCandidate);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room-created", onRoomCreated);
      socket.off("room-joined", onRoomJoined);
      socket.off("room-left", onRoomLeft);
      socket.off("user-joined", onUserJoined);
      socket.off("user-disconnected", onUserDisconnected);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIceCandidate);
    };
  }, []);
  
useEffect(()=>{
  if(!intent) return;
  console.log(intent);

  if(intent.type === "create-room"){
    socket.emit("create-room", intent.roomId);
    clearSocketIntent();
    return;
  }

  if(intent.type === "join-room"){
    socket.emit("join-room",intent.roomId);
    clearSocketIntent();
    return;
  } 

  if(intent.type === "leave-room"){
    socket.emit("leave-room", intent.roomId);
    clearSocketIntent();
    
  }

},[intent,clearSocketIntent])

};
