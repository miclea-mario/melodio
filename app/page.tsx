"use client";

import { SessionHistory } from "@/components/SessionHistory";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DarkVeil from "@/components/DarkVeil";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Flower, LogOut, Sparkles, TrendingUp, Award } from "lucide-react";
import Image from "next/image";
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

  // Calculate best meditation type based on rating improvements
  const getBestMeditationType = () => {
    if (!sessions || sessions.length === 0) return null;

    const typeImprovements: Record<string, { total: number; count: number }> = {};

    sessions.forEach((session) => {
      if (
        session.meditationType &&
        session.preSessionRating !== undefined &&
        session.postSessionRating !== undefined
      ) {
        const improvement = session.postSessionRating - session.preSessionRating;
        if (!typeImprovements[session.meditationType]) {
          typeImprovements[session.meditationType] = { total: 0, count: 0 };
        }
        typeImprovements[session.meditationType].total += improvement;
        typeImprovements[session.meditationType].count += 1;
      }
    });

    let bestType = "";
    let bestAverage = -Infinity;

    Object.entries(typeImprovements).forEach(([type, data]) => {
      const average = data.total / data.count;
      if (average > bestAverage && data.count >= 1) {
        bestAverage = average;
        bestType = type;
      }
    });

    if (bestType && bestAverage > 0) {
      return { type: bestType, improvement: bestAverage, count: typeImprovements[bestType].count };
    }

    return null;
  };

  const bestMeditation = getBestMeditationType();

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
    <div className="min-h-screen relative overflow-hidden bg-[#0a1628]">
      {/* Dark Veil Background */}
      <div className="fixed inset-0 pointer-events-none">
        <DarkVeil 
          hueShift={56}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={1}
          scanlineFrequency={0.5}
          warpAmount={0.1}
          resolutionScale={1}
        />
      </div>

      {/* Content wrapper with backdrop blur */}
      <div className="relative z-10">
      {/* Header */}
      <header className="p-6 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Melodio Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
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
          className="text-center py-16 space-y-6 min-h-[60vh] flex flex-col items-center justify-center"
        >
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

          {/* Best Meditation Type Insight */}
          {bestMeditation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-gradient-to-br from-teal-500/10 via-teal-600/5 to-green-500/10 border-2 border-teal-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-teal-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-semibold text-slate-100">
                        Your Best Meditation Type
                      </h4>
                      <Badge className="bg-teal-500/20 text-teal-300 border-teal-400/30">
                        {bestMeditation.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">
                          +{bestMeditation.improvement.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-400">avg improvement</span>
                      </div>
                      <div className="text-sm text-slate-400">
                        Based on {bestMeditation.count} session{bestMeditation.count > 1 ? "s" : ""}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300">
                      This meditation type consistently helps you feel better. Consider using it when you need the most support.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {sessions ? (
            <SessionHistory sessions={sessions} />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading sessions...</p>
            </div>
          )}
        </motion.section>
      </main>
      </div>
    </div>
  );
}
