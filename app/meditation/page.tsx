"use client";

import { AudioControls } from "@/components/AudioControls";
import { MeditationSubtitles } from "@/components/MeditationSubtitles";
import { Orb } from "@/components/ui/orb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useElevenLabsSession } from "@/hooks/useElevenLabsSession";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface MoodProfile {
  questions: Array<{
    question: string;
    answer: string;
  }>;
  summary: string;
  themes: string[];
  meditationType: string;
  preSessionRating?: number;
}

// Map mood types to color pairs for the Orb
function getMoodColors(meditationType: string): [string, string] {
  const moodColorMap: Record<string, [string, string]> = {
    "stress-relief": ["#4ade80", "#22c55e"], // Green tones
    "anxiety-reduction": ["#a855f7", "#9333ea"], // Purple tones
    sleep: ["#3b82f6", "#1d4ed8"], // Blue tones
    focus: ["#06b6d4", "#0891b2"], // Cyan tones
    "mood-lifting": ["#f59e0b", "#d97706"], // Orange tones
    "general-wellness": ["#14b8a6", "#0d9488"], // Teal tones
  };

  return moodColorMap[meditationType] || moodColorMap["general-wellness"];
}

// Map mood types to background classes
function getMoodBackground(meditationType: string): string {
  const moodBackgroundMap: Record<string, string> = {
    "stress-relief": "bg-mood-calm",
    "anxiety-reduction": "bg-mood-anxiety",
    sleep: "bg-mood-sleep",
    focus: "bg-mood-focus",
    "mood-lifting": "bg-mood-energy",
    "general-wellness": "bg-meditation-gradient",
  };

  return moodBackgroundMap[meditationType] || "bg-meditation-gradient";
}

export default function MeditationPage() {
  const router = useRouter();
  const createSession = useMutation(api.meditation.createSession);
  const userProfile = useQuery(api.userProfile.getProfile);

  const [moodProfile, setMoodProfile] = useState<MoodProfile | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const sessionStartedRef = useRef(false);
  const [postSessionRating, setPostSessionRating] = useState<number | null>(
    null,
  );
  const [showPostRating, setShowPostRating] = useState(false);

  // Background music audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load mood profile from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("moodProfile");
    if (stored) {
      setMoodProfile(JSON.parse(stored));
    } else {
      // Redirect to mood profiling if no profile
      router.push("/mood-profiling");
    }
  }, [router]);

  // Get agent config from environment
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "";
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";

  // State for audio analysis data
  const [analysisData, setAnalysisData] = useState({
    amplitude: 0,
    frequency: 0,
    energy: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  const lastUpdateRef = useRef(0);
  const audioDataRef = useRef(analysisData);

  // Initialize ElevenLabs session
  const {
    isConnected,
    isPlaying,
    error,
    messages,
    startSession,
    stopSession,
    togglePlayPause,
  } = useElevenLabsSession({
    agentId,
    convexUrl,
    userProfile: {
      name: userProfile?.name || "Friend",
      gender: userProfile?.gender,
      occupation: userProfile?.occupation,
    },
    moodData: {
      summary: moodProfile?.summary || "",
      questions: moodProfile?.questions || [],
    },
    onAudioStream: (audioData) => {
      // Throttle updates to max 30fps to prevent freezing
      const now = Date.now();
      if (now - lastUpdateRef.current < 33) {
        // 33ms = ~30fps
        return;
      }
      lastUpdateRef.current = now;

      // Process audio data for visualization
      // Calculate amplitude (RMS)
      let sum = 0;
      for (let i = 0; i < audioData.length; i++) {
        sum += audioData[i] * audioData[i];
      }
      const amplitude = Math.sqrt(sum / audioData.length);

      // Simple energy calculation (average absolute value)
      let energy = 0;
      for (let i = 0; i < audioData.length; i++) {
        energy += Math.abs(audioData[i]);
      }
      energy = energy / audioData.length;

      // Update analysis data for ORB
      const newData = {
        amplitude: amplitude * 2, // Scale for visibility
        frequency: 440, // Default frequency
        energy: energy * 2,
        bass: energy * 1.5,
        mid: energy,
        treble: energy * 0.8,
      };

      audioDataRef.current = newData;
      setAnalysisData(newData);
    },
  });

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Initialize background music
  useEffect(() => {
    // Create audio element for background music
    const audio = new Audio("/audio/soundscape.mp3");
    audio.loop = true;
    audio.volume = 0.3; // Set to 30% volume
    audioRef.current = audio;

    // Start playing when session begins
    if (moodProfile && userProfile) {
      audio.play().catch((err) => console.error("Failed to play audio:", err));
    }

    // Cleanup
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [moodProfile, userProfile]);

  // Start session when ready (only once)
  useEffect(() => {
    if (
      moodProfile &&
      userProfile &&
      !isConnected &&
      !sessionStartedRef.current
    ) {
      sessionStartedRef.current = true;
      startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodProfile, userProfile, isConnected]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    togglePlayPause();

    // Control background music
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current
          .play()
          .catch((err) => console.error("Failed to play audio:", err));
      }
    }
  };

  const handleVolumeChange = (volume: number) => {
    // Update background music volume
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  };

  const handleStop = () => {
    setShowExitDialog(true);
    setShowPostRating(true);
  };

  const handleConfirmExit = async () => {
    if (!postSessionRating) {
      return; // Don't allow exit without post-session rating
    }

    setIsSaving(true);

    try {
      // Stop background music
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Save session to database
      await createSession({
        mood: moodProfile?.themes?.[0] || "general",
        moodProfile: {
          questions: moodProfile?.questions || [],
          summary: moodProfile?.summary || "",
        },
        duration: sessionDuration,
        meditationType: moodProfile?.meditationType,
        preSessionRating: moodProfile?.preSessionRating || 5,
        postSessionRating: postSessionRating,
      });

      setSessionSaved(true);

      // Stop ElevenLabs session
      await stopSession();

      // Clear session storage
      sessionStorage.removeItem("moodProfile");

      // Redirect to home after a brief delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error saving session:", error);
      setIsSaving(false);
    }
  };

  if (!moodProfile || !userProfile) {
    return (
      <div className="min-h-screen bg-meditation-gradient flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${getMoodBackground(moodProfile.meditationType)} relative overflow-hidden`}
    >
      {/* Exit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-6 right-6 z-10"
      >
        <Button
          onClick={handleStop}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
        >
          <X className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Session Timer */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 left-6 z-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-full px-6 py-2">
          <p className="text-2xl font-mono text-teal-400">
            {formatTime(sessionDuration)}
          </p>
        </div>
      </motion.div>

      {/* Main Content - Meditation ORB */}
      <div className="h-screen flex items-center justify-center">
        <div className="w-[600px] h-[600px]">
          <Orb
            colors={getMoodColors(moodProfile.meditationType)}
            agentState={isPlaying ? "talking" : null}
            volumeMode="manual"
            manualOutput={analysisData.amplitude}
            manualInput={analysisData.energy}
          />
        </div>
      </div>

      {/* Audio Controls */}
      <AudioControls
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onVolumeChange={handleVolumeChange}
      />

      {/* Meditation Subtitles */}
      <MeditationSubtitles messages={messages} />

      {/* Mist Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-t from-teal-500/10 via-transparent to-transparent"
        />
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {sessionSaved ? "Session Complete" : "How do you feel now?"}
            </DialogTitle>
            {sessionSaved ? (
              <div className="flex items-center gap-2 text-teal-400 text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Your session has been saved successfully</span>
              </div>
            ) : (
              <DialogDescription className="text-slate-300">
                You&apos;ve meditated for {formatTime(sessionDuration)}. Please
                rate how you feel now.
              </DialogDescription>
            )}
          </DialogHeader>

          {!sessionSaved && showPostRating && (
            <div className="space-y-6 py-4">
              {/* Post-Session Rating */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    How do you feel now?
                  </h3>
                  <p className="text-slate-300 text-sm">
                    Choose the emoji that best reflects your mood
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                  {[
                    { emoji: "😢", rating: 1, label: "Very Bad" },
                    { emoji: "😔", rating: 2, label: "Bad" },
                    { emoji: "😐", rating: 3, label: "Neutral" },
                    { emoji: "😊", rating: 4, label: "Good" },
                    { emoji: "😄", rating: 5, label: "Excellent" },
                  ].map((item) => (
                    <button
                      key={item.rating}
                      onClick={() => setPostSessionRating(item.rating)}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 flex flex-col items-center gap-1 ${
                        postSessionRating === item.rating
                          ? "border-teal-400 bg-teal-500/20 shadow-lg shadow-teal-500/50"
                          : "border-slate-700 bg-slate-800/50 hover:border-teal-500/50"
                      }`}
                    >
                      <span className="text-xl sm:text-2xl">{item.emoji}</span>
                      <span className="text-xs text-slate-300 text-center leading-tight">
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show improvement indicator if both ratings exist */}
              {postSessionRating && moodProfile?.preSessionRating && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm text-slate-300 text-center">
                    {postSessionRating > moodProfile.preSessionRating && (
                      <span className="text-teal-400">
                        ✨ You&apos;re feeling better! (
                        {moodProfile.preSessionRating} → {postSessionRating})
                      </span>
                    )}
                    {postSessionRating === moodProfile.preSessionRating && (
                      <span className="text-slate-300">
                        Your mood is stable ({moodProfile.preSessionRating} →{" "}
                        {postSessionRating})
                      </span>
                    )}
                    {postSessionRating < moodProfile.preSessionRating && (
                      <span className="text-slate-300">
                        It&apos;s okay, meditation takes practice (
                        {moodProfile.preSessionRating} → {postSessionRating})
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Review Questions & Answers */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">
                  Session Summary
                </h4>
                {moodProfile?.questions.map((qa, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                  >
                    <p className="text-xs text-slate-400 mb-1">{qa.question}</p>
                    <p className="text-sm text-slate-200">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!sessionSaved && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowExitDialog(false);
                  setShowPostRating(false);
                  setPostSessionRating(null);
                }}
                disabled={isSaving}
                className="border-slate-600"
              >
                Continue Meditation
              </Button>
              <Button
                onClick={handleConfirmExit}
                disabled={isSaving || !postSessionRating}
                className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "End Session"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2"
        >
          <div className="bg-destructive/80 border border-destructive rounded-lg px-6 py-3 backdrop-blur-sm">
            <p className="text-destructive-foreground text-sm">
              Connection error: {error.message}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
