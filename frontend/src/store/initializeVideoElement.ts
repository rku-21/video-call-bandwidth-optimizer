import { useCallback, useRef } from "react";

export function useVideoElements() {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    const clearRemoteVideo = useCallback(() => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }, []);

    const stopPeer = useCallback(() => {
        const stream = localStreamRef.current;
        if (stream) {
            stream.getTracks().forEach((t) => t.stop());
        }
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }, []);

    const ensureLocalMedia = useCallback(async () => {
        if (localStreamRef.current) return localStreamRef.current;

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        return stream;
    }, []);

    const randomRoomId = useCallback(() => "", []);

    return {
        localVideoRef,
        remoteVideoRef,
        clearRemoteVideo,
        stopPeer,
        ensureLocalMedia,
        randomRoomId,
    };
}
