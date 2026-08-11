# Adaptive Video Compression

<p align="center">
  <img src="assets/logo.svg" alt="Adaptive Video Compression Logo" width="640" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/WebRTC-Real%20Time-4B9CD3" alt="WebRTC" />
  <img src="https://img.shields.io/badge/Python-FastAPI-3776AB" alt="Python" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

Adaptive Video Compression is a full-stack real-time communication system that improves WebRTC call quality by adapting video encoding parameters dynamically based on live network conditions. The project focuses on making video streaming more stable, responsive, and intelligent under fluctuating bandwidth, latency, and packet loss.

## Project Overview

This project was built to explore how real-time video calls can become more resilient through adaptive control. Instead of transmitting video at a fixed quality level, the system continuously monitors connection health and adjusts bitrate, frame rate, and resolution to maintain a better user experience during active calls.

## What I Built

- A real-time WebRTC-based video calling application with room creation, joining, and peer negotiation
- A live adaptive control loop that reads WebRTC statistics and applies sender-side video adjustments in real time
- A heuristic-based policy engine for adapting stream settings under changing network conditions
- An ML-assisted recommendation service that suggests better encoding parameters for the current connection state
- A monitoring dashboard that visualizes send bitrate, available bandwidth, RTT, packet loss, FPS, and dropped frames
- A backend signaling layer using Node.js and Socket.IO for session setup and media negotiation

## How It Works

1. A user creates or joins a call room.
2. The frontend establishes a WebRTC peer connection and begins streaming media.
3. Network statistics are collected continuously from the WebRTC connection.
4. The system evaluates the current conditions and selects an adaptation policy.
5. Recommended encoding adjustments are applied to improve video quality and stability.

## Architecture

- Frontend: React, TypeScript, Vite, Zustand, WebRTC, Socket.IO Client
- Backend: Node.js, Express, Socket.IO
- ML Service: Python, FastAPI, scikit-learn, joblib, Pydantic

## Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React-2025-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Python-FastAPI-3776AB?logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/scikit-learn-1.x-F7931E?logo=scikit-learn&logoColor=white" alt="scikit-learn" />
</p>

## Project Structure

- frontend/ - client-side UI, WebRTC handling, and adaptive controller
- backendTs/ - signaling server for room setup and peer exchange
- ml_service/ - inference API, telemetry pipeline, and model training workflow

## Key Highlights

- Adaptive video streaming under changing network conditions
- Real-time monitoring and decision-making
- Full-stack implementation combining frontend, backend, and ML components
- Demonstrates practical integration of WebRTC, networking, and machine learning

## Impact

This project highlights how intelligent, data-driven adaptation can improve the quality and reliability of real-time video communication in bandwidth-constrained environments.