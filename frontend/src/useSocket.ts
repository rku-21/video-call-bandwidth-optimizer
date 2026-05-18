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

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("room-created", onRoomCreated);
    socket.on("room-joined", onRoomJoined);
    socket.on("room-left", onRoomLeft);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room-created", onRoomCreated);
      socket.off("room-joined", onRoomJoined);
      socket.off("room-left", onRoomLeft);
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
