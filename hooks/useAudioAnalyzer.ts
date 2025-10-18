"use client";

import { AudioAnalysisData, AudioAnalyzer } from "@/lib/audioAnalyzer";
import { useEffect, useRef, useState } from "react";

export function useAudioAnalyzer(audioContext: AudioContext | null) {
  const [analysisData, setAnalysisData] = useState<AudioAnalysisData>({
    amplitude: 0,
    frequency: 0,
    energy: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioContext) {
      return;
    }

    // Create analyzer
    analyzerRef.current = new AudioAnalyzer(audioContext);

    // Animation loop to update analysis data
    const updateAnalysis = () => {
      if (analyzerRef.current) {
        const data = analyzerRef.current.getAnalysisData();
        setAnalysisData(data);
      }
      animationFrameRef.current = requestAnimationFrame(updateAnalysis);
    };

    updateAnalysis();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioContext]);

  return {
    analysisData,
    analyzer: analyzerRef.current,
  };
}

