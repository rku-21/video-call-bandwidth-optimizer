import { useCallback, useRef } from "react";
import { socket } from "../socket";
import { createRoomId } from "../math";

export function useVideoElements() {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);

    const getPeerConnection = useCallback(() => peerRef.current, []);

    const attachLocalStream = useCallback(() => {
        const el = localVideoRef.current;
        const stream = localStreamRef.current;
        if (!el || !stream) return;
        if (el.srcObject !== stream) el.srcObject = stream;
        
        el.play().catch(() => {});
    }, []);

    const attachRemoteStream = useCallback(() => {
        const el = remoteVideoRef.current;
        const stream = remoteStreamRef.current;
        if (!el || !stream) return;
        if (el.srcObject !== stream) el.srcObject = stream;
        el.play().catch(() => {});
    }, []);

    const closePeerConnection = useCallback(() => {
        const pc = peerRef.current;
        if (!pc) return;
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onconnectionstatechange = null;
        try {
            pc.close();
        } finally {
            peerRef.current = null;
        }
    }, []);

    const ensurePeerConnection = useCallback(
        (roomId: string) => {
            if (peerRef.current) return peerRef.current;

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
            });

            pc.onicecandidate = (event) => {
                if (!event.candidate) return;
                socket.emit("ice-candidate", {
                    roomId,
                    candidate: event.candidate,
                });
            };

            pc.ontrack = (event) => {
                const [firstStream] = event.streams;
                if (firstStream) {
                    remoteStreamRef.current = firstStream;
                } else {
                    let remoteStream = remoteStreamRef.current;
                    if (!remoteStream) {
                        remoteStream = new MediaStream();
                        remoteStreamRef.current = remoteStream;
                    }
                    remoteStream.addTrack(event.track);
                }
                attachRemoteStream();
            };

            peerRef.current = pc;
            return pc;
        },
        [attachRemoteStream]
    );

    const addLocalTracksToPeer = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
        const senderTracks = new Set(
            pc.getSenders()
                .map((s) => s.track)
                .filter((t): t is MediaStreamTrack => Boolean(t))
        );

        for (const track of stream.getTracks()) {
            if (senderTracks.has(track)) continue;
            pc.addTrack(track, stream);
        }
    }, []);

    const clearRemoteVideo = useCallback(() => {
        remoteStreamRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }, []);

    const stopPeer = useCallback(() => {
        closePeerConnection();

        const localStream = localStreamRef.current;
        if (localStream) {
            localStream.getTracks().forEach((t) => t.stop());
        }
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;

        remoteStreamRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }, [closePeerConnection]);

    const resetPeerConnection = useCallback(() => {
        closePeerConnection();
        remoteStreamRef.current = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }, [closePeerConnection]);

    const ensureLocalMedia = useCallback(async (): Promise<MediaStream> => {
        if (localStreamRef.current) {
            attachLocalStream();
            return localStreamRef.current;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        localStreamRef.current = stream;
        attachLocalStream();

        return stream;
    }, [attachLocalStream]);

    const startCallOffer = useCallback(
        async (roomId: string) => {
            const stream = await ensureLocalMedia();
            const pc = ensurePeerConnection(roomId);
            addLocalTracksToPeer(pc, stream);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit("offer", roomId, offer);
        },
        [addLocalTracksToPeer, ensureLocalMedia, ensurePeerConnection]
    );

    const handleOffer = useCallback(
        async (roomId: string, offer: RTCSessionDescriptionInit) => {
            const stream = await ensureLocalMedia();
            const pc = ensurePeerConnection(roomId);
            addLocalTracksToPeer(pc, stream);

            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("answer", { roomId, answer });
        },
        [addLocalTracksToPeer, ensureLocalMedia, ensurePeerConnection]
    );

    const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        const pc = peerRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(answer);
    }, []);

    const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        const pc = peerRef.current;
        if (!pc) return;
        try {
            await pc.addIceCandidate(candidate);
        } catch {
            // Ignore candidates that arrive before remote description is set
        }
    }, []);

    const setAudioEnabled = useCallback((enabled: boolean) => {
        const stream = localStreamRef.current;
        if (!stream) return;
        for (const t of stream.getAudioTracks()) {
            t.enabled = enabled;
        }
    }, []);

    const setVideoEnabled = useCallback((enabled: boolean) => {
        const stream = localStreamRef.current;
        if (!stream) return;
        for (const t of stream.getVideoTracks()) {
            t.enabled = enabled;
        }
        
        attachLocalStream();
    }, [attachLocalStream]);

    const randomRoomId = useCallback(() => createRoomId(), []);

    return {
        localVideoRef,
        remoteVideoRef,
        clearRemoteVideo,
        stopPeer,
        resetPeerConnection,
        ensureLocalMedia,
        attachLocalStream,
        attachRemoteStream,
        getPeerConnection,
        startCallOffer,
        handleOffer,
        handleAnswer,
        handleIceCandidate,
        setAudioEnabled,
        setVideoEnabled,
        randomRoomId,
    };
}
