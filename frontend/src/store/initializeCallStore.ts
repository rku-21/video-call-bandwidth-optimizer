import { useCallStore } from "./useCallStore";

export function useCallBindings() {
    const initCallStore = useCallStore((s) => s.init);
    const roomId = useCallStore((s) => s.roomId);
    const setRoomId = useCallStore((s) => s.setRoomId);
    const error = useCallStore((s) => s.error);
    const callActive = useCallStore((s) => s.callActive);
    const createRoom = useCallStore((s) => s.createRoom);
    const joinRoom = useCallStore((s) => s.joinRoom);
    const leaveRoom = useCallStore((s) => s.leaveRoom);
    const intent =useCallStore((s)=> s.socketIntent);
    return {
        initCallStore,
        roomId,
        setRoomId,
        error,
        callActive,
        createRoom,
        joinRoom,
        leaveRoom,
        intent,
    };
}
