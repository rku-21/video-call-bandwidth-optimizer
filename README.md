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

## Deploy (One-click) — Render

This repo includes a Render Blueprint: [render.yaml](render.yaml)

1. Push this repo to GitHub.
2. Click the button below (replace the URL with your repo URL):

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_ORG/YOUR_REPO)

Render will create two services:
- `avc-backendts` (Node web service)
- `avc-frontend` (static site)

### Notes

- The frontend expects `VITE_SOCKET_URL` at build time.
  - The Blueprint sets `VITE_SOCKET_URL` by referencing the backend’s `RENDER_EXTERNAL_URL`.
- If you rename services in `render.yaml`, update the `fromService.name` accordingly.

## Run locally

### Backend

```bash
cd backendTs
npm install
npm run build
npm start
```

Backend listens on `http://localhost:5050` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend defaults to `VITE_SOCKET_URL=http://localhost:5050` if not provided.

## Roadmap (ML / Adaptive compression)

Ideas to build next (not fully implemented yet):
- CNN-based ROI/importance estimation per frame
- Adaptive bitrate/quality per region (foreground vs background)
- Bandwidth-aware control loop using WebRTC stats

## License

No license file yet. If you plan to open-source publicly, add a license (MIT/Apache-2.0/etc.).
