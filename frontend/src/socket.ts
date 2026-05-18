import { io, type Socket } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? "http://localhost:5050";

export const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
