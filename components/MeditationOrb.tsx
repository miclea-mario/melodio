"use client";

import { AudioAnalysisData } from "@/lib/audioAnalyzer";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface MeditationOrbProps {
  analysisData: AudioAnalysisData;
  mood?: string;
  isActive?: boolean;
}

export function MeditationOrb({ analysisData, mood = "calm", isActive = true }: MeditationOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Map mood to color hue
  const getMoodHue = (moodType: string): number => {
    const moodMap: Record<string, number> = {
      calm: 180, // Cyan
      stressed: 30, // Orange
      anxious: 280, // Purple
      energized: 120, // Green
      tired: 240, // Blue
      default: 180,
    };
    return moodMap[moodType] || moodMap.default;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.5;
      canvas.width = size;
      canvas.height = size;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    let time = 0;

    const drawOrb = () => {
      if (!ctx || !canvas) return;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate dynamic properties based on audio
      const baseRadius = Math.min(width, height) * 0.25;
      const amplitude = analysisData.amplitude;
      const energy = analysisData.energy;

      // Scale orb based on amplitude (0.8x to 1.3x)
      const scale = 0.8 + amplitude * 0.5;
      const radius = baseRadius * scale;

      // Determine color based on mood and frequency
      const baseHue = getMoodHue(mood);
      const frequencyShift = (analysisData.frequency / 1000) * 30; // Shift hue based on frequency
      const hue = (baseHue + frequencyShift) % 360;

      // Pulsing effect
      const pulse = Math.sin(time * 2) * 0.1 * energy;

      // Draw outer glow layers
      for (let i = 5; i >= 0; i--) {
        const glowRadius = radius * (1 + i * 0.15 + pulse);
        const alpha = (0.15 - i * 0.02) * (0.5 + energy * 0.5);

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        gradient.addColorStop(0, `hsla(${hue}, 70%, 60%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${hue + 10}, 80%, 50%, ${alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${hue + 20}, 90%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw main orb
      const mainGradient = ctx.createRadialGradient(
        centerX - radius * 0.2,
        centerY - radius * 0.2,
        radius * 0.1,
        centerX,
        centerY,
        radius
      );

      mainGradient.addColorStop(0, `hsla(${hue + 30}, 90%, 80%, 0.9)`);
      mainGradient.addColorStop(0.3, `hsla(${hue + 20}, 85%, 65%, 0.85)`);
      mainGradient.addColorStop(0.7, `hsla(${hue}, 80%, 50%, 0.8)`);
      mainGradient.addColorStop(1, `hsla(${hue - 20}, 75%, 35%, 0.9)`);

      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Add particles for high energy moments
      if (energy > 0.5) {
        const particleCount = Math.floor(energy * 20);
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + time;
          const distance = radius * (1.2 + Math.sin(time * 3 + i) * 0.2);
          const particleX = centerX + Math.cos(angle) * distance;
          const particleY = centerY + Math.sin(angle) * distance;
          const particleSize = 2 + energy * 3;

          ctx.fillStyle = `hsla(${hue + 40}, 90%, 70%, ${energy * 0.6})`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Add subtle rings based on frequency bands
      if (analysisData.bass > 0.3) {
        ctx.strokeStyle = `hsla(${hue - 30}, 70%, 50%, ${analysisData.bass * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
        ctx.stroke();
      }

      time += isActive ? 0.02 : 0.005;
      animationFrameRef.current = requestAnimationFrame(drawOrb);
    };

    drawOrb();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [analysisData, mood, isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{
          filter: "blur(0.5px)",
        }}
      />
    </motion.div>
  );
}

