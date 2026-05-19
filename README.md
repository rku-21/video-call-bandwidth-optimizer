# Adaptive Video Compression (WebRTC Demo)

A minimal, open-source two‑person video calling app built with **WebRTC** (media), **Socket.IO** (signaling), **React + Vite** (frontend), and a small **Node/Express** server (backend).

The long-term goal of this repo is to experiment with **adaptive, ML‑assisted video compression** (e.g., CNN‑based importance maps / region-of-interest encoding). Today, the project ships a working baseline video call pipeline you can extend.

## Features

- Create a room and share a `roomId`
- Join a room from another browser/device
- WebRTC offer/answer + ICE candidate signaling via Socket.IO
- Local controls: mute / camera on-off
- Basic reconnection: refresh → auto-rejoin last room (session-based)

## Architecture (high level)

- **frontend/**: React UI + WebRTC peer connection + Socket.IO client
- **backendTs/**: Express + Socket.IO signaling server

WebRTC media is peer-to-peer. The backend only relays signaling messages:
- `create-room`, `join-room`, `leave-room`
- `offer`, `answer`, `ice-candidate`

## How it works

1. **Room setup**
  - One user creates a `roomId`.
  - The second user joins using the same `roomId`.

2. **Signaling (Socket.IO)**
  - When the second user joins, the clients exchange:
    - WebRTC SDP **offer** / **answer**
    - ICE **candidates**
  - The server does not handle media; it only forwards signaling events to the other peer in the room.

3. **Media (WebRTC P2P)**
  - Each client captures local camera/mic with `getUserMedia()`.
  - A `RTCPeerConnection` is created and local tracks are added.
  - When negotiation completes, audio/video flows directly between the two browsers.

4. **In-call controls**
  - “Mute” toggles the local audio track enabled state.
  - “Camera off” toggles the local video track enabled state.

5. **Refresh recovery (basic)**
  - The frontend stores the last active `roomId` in session storage and attempts to re-join after a refresh.
