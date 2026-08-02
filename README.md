# Adaptive Video Compression

Adaptive Video Compression is a real-time WebRTC video calling project that adds live, ML-assisted adaptation on top of a normal two-person call. The app monitors WebRTC network stats, chooses an encoding strategy, and updates video sender parameters in real time so the call can react to changing bandwidth, latency, and packet loss.

The project is built as three connected services:

- `frontend/` - React + Vite UI, WebRTC peer connection, live stats panel, and adaptive controller
- `backendTs/` - Node.js + Express + Socket.IO signaling server for room setup and ICE/SDP exchange
- `ml_service/` - FastAPI service that recommends bitrate, FPS, and scaling hints and stores telemetry for training

## What I built

This project is more than a basic video call. It includes:

- Room-based WebRTC calling with create/join/leave flow
- Socket.IO signaling for offer, answer, and ICE candidates
- Local camera and microphone streaming
- Real-time adaptive video control using `RTCRtpSender.setParameters()`
- Live on-screen metrics such as send bitrate, available bitrate, RTT, packet loss, FPS, and dropped frames
- Three adaptation modes:
  - Off
  - Auto
  - Heuristic
  - ML service
- A Python ML service that can recommend encoding settings
- Telemetry logging and a simple training pipeline for the ML model

## How it works

### 1. Call setup
- One user creates a room.
- Another user joins with the same room ID.
- The signaling server relays WebRTC negotiation messages.
- After negotiation, audio and video flow peer-to-peer.

### 2. Adaptive loop
- The frontend reads live WebRTC statistics every second.
- It converts those stats into a snapshot of the current network state.
- Based on the selected mode, it chooses either:
  - a local heuristic policy, or
  - a recommendation from the ML service
- The chosen hint is applied to the outgoing video sender.

### 3. What the ML service does
- The ML service receives WebRTC stats.
- It returns an encoding hint containing:
  - suggested maximum bitrate
  - suggested FPS
  - suggested resolution scale-down factor
- If the trained model is available, it is used for prediction.
- If not, the service falls back to the heuristic policy so the app still works.

### 4. What the numbers on screen mean
- `send bitrate` = estimated outgoing bitrate from the WebRTC sender
- `available bitrate` = estimated network capacity from the candidate pair
- `rtt` = round-trip time in milliseconds
- `loss` = packet loss percentage
- `fps` = frames per second being encoded/sent
- `dropped` = dropped or discarded video frames
- `hint` = the adaptation values currently being recommended
- `apply` = whether the sender settings were actually applied
- `policy` = which policy produced the recommendation
- `importance (ROI)` = the adaptive importance score used by the policy logic

## Project structure

- `frontend/src/App.tsx` wires the UI, call store, and adaptive controller together
- `frontend/src/adaptive/controller.ts` runs the live adaptation loop
- `frontend/src/adaptive/webrtcStats.ts` reads WebRTC stats from the peer connection
- `frontend/src/adaptive/policy.ts` contains the local heuristic policy
- `frontend/src/adaptive/mlClient.ts` calls the ML API
- `frontend/src/pages/home.tsx` renders the video call UI and the live adaptive stats
- `backendTs/src/` contains the Socket.IO signaling server
- `ml_service/src/ml_service/` contains the FastAPI API, model loader, heuristic fallback, schemas, and telemetry logic
- `ml_service/scripts/` contains the seed data generator and model training script

## Tech stack

### Frontend
- React
- Vite
- TypeScript
- Zustand
- Socket.IO client
- WebRTC browser APIs

### Signaling server
- Node.js
- Express
- Socket.IO
- TypeScript

### ML service
- Python
- FastAPI
- Pydantic
- scikit-learn
- joblib
- Uvicorn

## In short

This project demonstrates a real-time adaptive video calling system where the frontend measures network conditions, the ML service or heuristic policy recommends encoding changes, and the sender parameters are updated live during the call.