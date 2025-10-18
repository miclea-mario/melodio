"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";

interface Session {
  _id: string;
  mood: string;
  duration: number;
  timestamp: number;
  meditationType?: string;
}

interface SessionHistoryProps {
  sessions: Session[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No meditation sessions yet. Start your first one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session, index) => (
        <motion.div
          key={session._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <Card className="p-4 bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-slate-700 hover:border-teal-500/30 transition-all hover:shadow-lg hover:shadow-teal-500/10">
            <div className="space-y-3">
              {/* Mood & Type */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100 capitalize">
                  {session.mood}
                </h3>
                {session.meditationType && (
                  <Badge variant="outline" className="border-teal-500/30 text-teal-400">
                    {session.meditationType}
                  </Badge>
                )}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(session.duration)}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(session.timestamp)}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

