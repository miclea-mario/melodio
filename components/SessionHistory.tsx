"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Session {
  _id: string;
  mood: string;
  duration: number;
  timestamp: number;
  meditationType?: string;
  preSessionRating?: number;
  postSessionRating?: number;
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

  const getRatingImprovement = (pre?: number, post?: number) => {
    if (pre === undefined || post === undefined) return null;
    return post - pre;
  };

  const getRatingColor = (improvement: number | null) => {
    if (improvement === null) return "text-slate-400";
    if (improvement > 0) return "text-green-400";
    if (improvement < 0) return "text-amber-400";
    return "text-slate-400";
  };

  const getRatingIcon = (improvement: number | null) => {
    if (improvement === null) return null;
    if (improvement > 0) return <TrendingUp className="w-4 h-4" />;
    if (improvement < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
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
                  <Badge variant="outline" className="border-teal-500/30 text-teal-400 text-xs">
                    {session.meditationType}
                  </Badge>
                )}
              </div>

              {/* Ratings */}
              {session.preSessionRating !== undefined && session.postSessionRating !== undefined && (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Before</p>
                      <p className="text-2xl font-bold text-slate-300">{session.preSessionRating}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${getRatingColor(getRatingImprovement(session.preSessionRating, session.postSessionRating))}`}>
                      {getRatingIcon(getRatingImprovement(session.preSessionRating, session.postSessionRating))}
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">After</p>
                      <p className="text-2xl font-bold text-slate-300">{session.postSessionRating}</p>
                    </div>
                  </div>
                </div>
              )}

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

