"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Pause, Play, Square, Volume2 } from "lucide-react";
import { useState } from "react";

interface AudioControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onVolumeChange?: (volume: number) => void;
}

export function AudioControls({
  isPlaying,
  onPlayPause,
  onStop,
  onVolumeChange,
}: AudioControlsProps) {
  const [volume, setVolume] = useState([80]);

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    onVolumeChange?.(newVolume[0] / 100); // Convert 0-100 to 0-1
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-10"
    >
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full px-8 py-4 shadow-2xl shadow-teal-500/10">
        <div className="flex items-center gap-6">
          {/* Play/Pause Button */}
          <Button
            onClick={onPlayPause}
            size="lg"
            className="rounded-full w-14 h-14 bg-teal-600 hover:bg-teal-500 transition-all shadow-lg shadow-teal-500/30"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </Button>

          {/* Stop Button */}
          <Button
            onClick={onStop}
            size="lg"
            variant="outline"
            className="rounded-full w-12 h-12 border-slate-600 hover:border-red-500/50 hover:bg-red-500/10"
          >
            <Square className="w-5 h-5" />
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-3 px-4">
            <Volume2 className="w-5 h-5 text-slate-400" />
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

