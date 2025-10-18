"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface Message {
  text: string;
  isAgent: boolean;
  timestamp: number;
}

interface MeditationSubtitlesProps {
  messages: Message[];
}

export function MeditationSubtitles({ messages }: MeditationSubtitlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-20 h-[70vh] w-80 pointer-events-none">
      {/* Scrollable credits container with gradient mask */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hide relative"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      >
        <div className="space-y-6 py-32">
          {messages.map((message, index) => (
            <motion.div
              key={`${message.timestamp}-${index}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-1"
            >
              {/* Speaker label */}
              <div className="text-teal-400/60 text-xs font-medium uppercase tracking-wider">
                {message.isAgent ? "Guide" : "You"}
              </div>
              {/* Message text */}
              <div className="text-slate-300/80 text-sm leading-relaxed">
                {message.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
