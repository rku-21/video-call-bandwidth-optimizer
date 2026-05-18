import { create } from "zustand";
import { createRoomId } from "../math";

export type SocketIntent= {type:"create-room"; roomId:string} | {type:"join-room"; roomId:string} | {type:"leave-room"; roomId:string};



type CallDeps = {
  ensureLocalMedia: () => Promise<unknown>;
  stopPeer: () => void;
  clearRemoteVideo: () => void;
  randomRoomId: () => string;
};

export type CallStore = {
  deps: CallDeps | null;

  roomId: string;
  currentRoomId: string;
  error: string;
  callActive: boolean;
  isRoomCreator: boolean;
  isCreatingRoom: boolean;

  socketIntent: SocketIntent | null;

  init: (deps: CallDeps) => void;
  setRoomId: (value: string) => void;
  clearSocketIntent: () => void;

  createRoom: () => Promise<void>;
  joinRoom: () => Promise<void>;
  leaveRoom: () => void;
};

export const useCallStore = create<CallStore>((set, get) => ({
  deps: null,

  roomId: "",
  currentRoomId: "",
  error: "",
  callActive: false,
  isRoomCreator: false,
  isCreatingRoom: false,

  socketIntent: null,

  init: (deps) => {
    set({ deps });
  },

  setRoomId: (value) => {
    set({ roomId: value });
    if (get().error) set({ error: "" });
  },

  clearSocketIntent: () => {
    set({ socketIntent: null });
  },

  createRoom: async () => {
    const deps = get().deps;
    if(!deps) throw new Error ("Call dependencies isn not initialized");

    set({
      isRoomCreator: true,
      isCreatingRoom: true,
      error: "",
    });

    deps.stopPeer();
    deps.clearRemoteVideo();

    
    const newRoomId= createRoomId();
    set({ roomId:newRoomId, currentRoomId:newRoomId});

    try {
      await deps.ensureLocalMedia();
      set({ socketIntent: { type: "create-room", roomId:newRoomId}});
      set({ callActive: true });
    } catch (e) {
       set({
        error:(e as Error)?.message || String(e),
        callActive:false
       })
    } finally {
      set({ isCreatingRoom: false });
    }
  },

  joinRoom: async () => {
    const deps = get().deps;
    if (!deps) throw new Error("Call store not initialized");

    set({
      isRoomCreator: false,
      isCreatingRoom: false,
    });

    deps.stopPeer();
    deps.clearRemoteVideo();

    const rid = get().roomId.trim();
    if (!rid) {
      set({ error: "Please enter a room ID to join", callActive: false });
      return;
    }

    set({ currentRoomId: rid, error: "" });

    try {
      await deps.ensureLocalMedia();
      set({ socketIntent: { type: "join-room", roomId: rid } });
      set({ callActive: true });
    } catch (e) {
      set({
        error: (e as Error)?.message || String(e),
        callActive: false,
      });
    }
  },

  leaveRoom: () => {
    const deps = get().deps;
    if (!deps) return;

    const rid = get().currentRoomId.trim();
    if (rid) set({ socketIntent: { type: "leave-room", roomId: rid } });

    deps.stopPeer();
    deps.clearRemoteVideo();

    set({
      currentRoomId: "",
      isRoomCreator: false,
      callActive: false,
      error: "",
    });
  },
}));
