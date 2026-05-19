import { useEffect } from "react";
import { socket } from "../socket";
import { useCallStore } from "../store/useCallStore";

const STORAGE_KEY = "avc:lastRoomId";

function readLastRoomId(): string | null {
  try {
    const rawData= sessionStorage.getItem(STORAGE_KEY);
    if (!rawData) return null;
    const parsedData = JSON.parse(rawData) as { roomId?: unknown; ts?: unknown };
    const roomId=String(parsedData.roomId);
    if (!roomId) return null;
    return roomId;
  } catch {

    return null;
  }
}
function writeLastRoomId (roomId:string):void {
    try{
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({roomId:roomId.trim(), ts:Date.now()})
        );

    }
    catch{
        
    }
}

function clearLastRoomId(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    
  }
}

export function useCallReconnection(): void {
   useEffect(() => {
    const unsubscribe = useCallStore.subscribe((state, prev) => {
      const prevActive = prev.callActive;
      const nextActive = state.callActive;
      const nextRoomId = state.currentRoomId.trim();

      if (nextActive && nextRoomId) {
        writeLastRoomId(nextRoomId);
      }

      if (prevActive && !nextActive) {
        clearLastRoomId();
      }
    });

    return unsubscribe;
  }, []);

 
  useEffect(() => {
    const last = readLastRoomId();
    if (!last) return;

    const { callActive } = useCallStore.getState();
    if (callActive) return;

    useCallStore.setState({ roomId: last });
    useCallStore
      .getState()
      .joinRoom()
      .catch((e) => {
        useCallStore.setState({ error: (e as Error)?.message || String(e) });
      });
  }, []);

  
  useEffect(() => {
    const onConnect = () => {
      const state = useCallStore.getState();
      if (!state.callActive) return;

      const roomId = state.currentRoomId.trim();
      if (!roomId) return;
       socket.emit("join-room", roomId);

      
      state.deps?.attachLocalStream();
      state.deps?.attachRemoteStream();
    };

    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
    };
  }, []);
}
