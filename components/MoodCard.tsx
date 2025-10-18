"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface MoodCardProps {
  option: string;
  index: number;
  onSelect: () => void;
  isSelected?: boolean;
}

export function MoodCard({ option, index, onSelect, isSelected = false }: MoodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card
        className={`
          p-6 cursor-pointer transition-all duration-300
          bg-gradient-to-br from-slate-800/50 to-slate-900/50
          border-2 backdrop-blur-sm
          hover:from-teal-900/30 hover:to-slate-800/30
          hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/20
          ${
            isSelected
              ? "border-teal-400 shadow-lg shadow-teal-400/30 from-teal-900/40 to-slate-800/40"
              : "border-slate-700"
          }
        `}
        onClick={onSelect}
      >
        <p className="text-center text-lg text-slate-100 font-medium">{option}</p>
      </Card>
    </motion.div>
  );
}

