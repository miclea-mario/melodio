"use client";

import { ElevenLabsSession, MoodData, UserProfile } from "@/lib/elevenlabs";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseElevenLabsSessionProps {
  agentId: string;
  convexUrl: string;
  userProfile: UserProfile;
  moodData: MoodData;
  onAudioStream?: (audioData: Float32Array) => void;
}

export function useElevenLabsSession({
  agentId,
  convexUrl,
  userProfile,
  moodData,
  onAudioStream,
}: UseElevenLabsSessionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<
    Array<{ text: string; isAgent: boolean; timestamp: number }>
  >([]);

  const sessionRef = useRef<ElevenLabsSession | null>(null);
  const isStartingRef = useRef(false);

  const handleConnect = useCallback(() => {
    console.log("Connected to ElevenLabs");
    setIsConnected(true);
    setIsPlaying(true);
    setError(null);
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("Disconnected from ElevenLabs");
    setIsConnected(false);
    setIsPlaying(false);
  }, []);

  const handleError = useCallback((err: Error) => {
    console.error("ElevenLabs error:", err);
    setError(err);
    setIsConnected(false);
    setIsPlaying(false);
  }, []);

  const handleMessage = useCallback((message: string, isAgent: boolean) => {
    setMessages((prev) => [
      ...prev,
      { text: message, isAgent, timestamp: Date.now() },
    ]);
  }, []);

  const startSession = useCallback(async () => {
    // Prevent multiple simultaneous starts
    if (sessionRef.current?.isActive() || isStartingRef.current) {
      console.log("Session already active or starting, skipping...");
      return;
    }

    isStartingRef.current = true;

    try {
      if (!agentId) {
        handleError(
          new Error(
            "ElevenLabs Agent ID not configured. Please add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to your .env.local file",
          ),
        );
        return;
      }

      if (!convexUrl) {
        handleError(
          new Error(
            "Convex URL not configured. Please add NEXT_PUBLIC_CONVEX_URL to your .env.local file",
          ),
        );
        return;
      }

      const session = new ElevenLabsSession({
        agentId,
        convexUrl,
        userProfile,
        moodData,
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onError: handleError,
        onMessage: handleMessage,
        onAudioStream,
      });

      sessionRef.current = session;
      await session.start();
    } finally {
      isStartingRef.current = false;
    }
  }, [
    agentId,
    convexUrl,
    userProfile,
    moodData,
    handleConnect,
    handleDisconnect,
    handleError,
    handleMessage,
    onAudioStream,
  ]);

  const stopSession = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.stop();
      sessionRef.current = null;
      isStartingRef.current = false;
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      // Pause implementation
      setIsPlaying(false);
    } else {
      // Resume implementation
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop();
      }
    };
  }, []);

  return {
    isConnected,
    isPlaying,
    error,
    messages,
    startSession,
    stopSession,
    togglePlayPause,
  };
}
