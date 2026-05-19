import { io, type Socket } from "socket.io-client";

const envUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
const SOCKET_URL =
  envUrl?.trim() || (import.meta.env.DEV ? "http://localhost:5050" : window.location.origin);

export const socket: Socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
