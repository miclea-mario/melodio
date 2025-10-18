"use client";

import { SessionHistory } from "@/components/SessionHistory";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../convex/_generated/api";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const userProfile = useQuery(api.userProfile.getProfile);
  const sessions = useQuery(api.meditation.getUserSessions, { limit: 6 });
  const stats = useQuery(api.meditation.getSessionStats);

  const handleStartMeditation = () => {
    router.push("/mood-profiling");
  };

  const handleSignOut = () => {
    void signOut().then(() => {
      router.push("/signin");
    });
  };

  // Check if user needs to complete profile
  if (isAuthenticated && userProfile !== undefined && !userProfile?.profileCompleted) {
    router.push("/profile-setup");
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0c2234] to-[#0d3d3d] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0c2234] to-[#0d3d3d]">
      {/* Header */}
      <header className="p-6 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Melodio</h1>
              <p className="text-xs text-slate-400">AI-Powered Meditation</p>
            </div>
          </motion.div>

          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="text-right">
                <p className="text-sm text-slate-100">
                  {userProfile?.name || "Welcome"}
                </p>
                <p className="text-xs text-slate-400">
                  {stats?.totalSessions || 0} sessions
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-100"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16 space-y-6"
        >
          {/* Preview ORB (static visual) */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-teal-400/30 to-teal-600/30 blur-2xl"
          />

          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-slate-100">
              Find Your Inner Peace
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience AI-guided meditation with personalized sessions tailored to your mood
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleStartMeditation}
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white text-lg px-8 py-6 rounded-full shadow-2xl shadow-teal-500/30 transition-all"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Meditation
            </Button>
          </motion.div>
        </motion.section>

        {/* Stats Section */}
        {stats && stats.totalSessions > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-teal-400">
                {stats.totalSessions}
              </p>
              <p className="text-sm text-slate-400 mt-1">Total Sessions</p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-teal-400">
                {Math.floor(stats.totalDuration / 60)}m
              </p>
              <p className="text-sm text-slate-400 mt-1">Total Time</p>
            </div>
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg p-6 text-center">
              <p className="text-3xl font-bold text-teal-400">
                {Math.floor(stats.averageDuration / 60)}m
              </p>
              <p className="text-sm text-slate-400 mt-1">Avg. Session</p>
            </div>
          </motion.section>
        )}

        {/* Session History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-slate-100">
              Recent Sessions
            </h3>
          </div>

          {sessions ? (
            <SessionHistory sessions={sessions} />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading sessions...</p>
            </div>
          )}
        </motion.section>
      </main>

      {/* Mist Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-t from-transparent via-teal-500/10 to-transparent"
        />
      </div>
    </div>
  );
}
