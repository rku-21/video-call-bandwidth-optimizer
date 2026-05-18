import { useCallback, useState } from "react";

type CallingStateDeps = {
  ensureLocalMedia: () => Promise<unknown>;
  stopPeer: () => void;
  clearRemoteVideo: () => void;
  randomRoomId: () => string;
  setCurrentRoomId: (roomId: string) => void;
  setIsRoomCreator: (isCreator: boolean) => void;
  emitCreateRoom: (roomId: string) => void;
  emitJoinRoom: (roomId: string) => void;
  emitLeaveRoom: (roomId: string) => void;
};

export type CallingState = {
  roomId: string;
  setRoomId: (value: string) => void;
  error: string;
  callActive: boolean;
  createRoom: () => Promise<void>;
  joinRoom: () => Promise<void>;
  leaveRoom: () => void;
};

export function useCallingState(deps: CallingStateDeps): CallingState {
  const [roomId, setRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [callActive, setCallActive] = useState<boolean>(false);

  const setRoomIdValue = useCallback(
    (value: string) => {
      setRoomId(value);
      if (error) setError("");
    },
    [error]
  );

  const createRoom = useCallback(async () => {
    deps.setIsRoomCreator(true);

    deps.stopPeer();
    deps.clearRemoteVideo();

    let rid = roomId.trim();
    if (!rid) {
      rid = deps.randomRoomId();
      setRoomId(rid);
    }

    deps.setCurrentRoomId(rid);

    try {
      setError("");
      await deps.ensureLocalMedia();
      deps.emitCreateRoom(rid);
      setCallActive(true);
    } catch (e) {
      setError((e as Error)?.message || String(e));
      setCallActive(false);
    }
  }, [deps, roomId]);

  const joinRoom = useCallback(async () => {
    deps.setIsRoomCreator(false);

    deps.stopPeer();
    deps.clearRemoteVideo();

    const rid = roomId.trim();
    if (!rid) {
      setError("Please enter a room ID to join");
      return;
    }

    deps.setCurrentRoomId(rid);

    try {
      setError("");
      await deps.ensureLocalMedia();
      deps.emitJoinRoom(rid);
      setCallActive(true);
    } catch (e) {
      setError((e as Error)?.message || String(e));
      setCallActive(false);
    }
  }, [deps, roomId]);

  const leaveRoom = useCallback(() => {
    const rid = roomId.trim();
    if (rid) deps.emitLeaveRoom(rid);

    deps.stopPeer();
    deps.clearRemoteVideo();
    deps.setCurrentRoomId("");
    deps.setIsRoomCreator(false);

    setError("");
    setCallActive(false);
  }, [deps, roomId]);

  return {
    roomId,
    setRoomId: setRoomIdValue,
    error,
    callActive,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
