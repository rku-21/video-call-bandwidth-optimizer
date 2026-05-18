import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = http.createServer(app);

const allowAnyOrigin = (
  origin: string | undefined,
  callback: (err: Error | null, allow: boolean) => void
) => callback(null, true);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production" ? true : allowAnyOrigin,
    credentials: true,
  },
  pingInterval: 60000,
  pingTimeout: 25000,
});

io.on("connection", (socket) => {
  console.log(`user connected with socket id ${socket.id}`);

  socket.on("create-room", (roomId: string) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.emit("room-created", roomId);
    console.log(`user ${socket.id} created a room with roomId ${roomId}`);
  });

  socket.on("join-room", (roomId: string) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.emit("room-joined", roomId);
    console.log(`user ${socket.id} joined the room with id ${roomId}`);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("leave-room", (roomId: string) => {
    if (!roomId) return;
    socket.leave(roomId);
    socket.emit("room-left", roomId);
    socket.to(roomId).emit("user-disconnected", socket.id);
    console.log(`user ${socket.id} left the room with id ${roomId}`);
  });

  socket.on("offer", (roomId: string, offer: unknown) => {
    if (!roomId) return;
    socket.to(roomId).emit("offer", {
      offer,
      senderSocketId: socket.id,
    });
  });

  socket.on("answer", ({ roomId, answer }: { roomId: string; answer: unknown }) => {
    if (!roomId) return;
    socket.to(roomId).emit("answer", {
      answer,
      senderSocketId: socket.id,
    });
  });

  socket.on(
    "ice-candidate",
    ({ roomId, candidate }: { roomId: string; candidate: unknown }) => {
      if (!roomId) return;
      socket.to(roomId).emit("ice-candidate", {
        candidate,
        senderSocketId: socket.id,
      });
    }
  );

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      if (room === socket.id) return;
      socket.to(room).emit("user-disconnected", socket.id);
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

export { app, httpServer };