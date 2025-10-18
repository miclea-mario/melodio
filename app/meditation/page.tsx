"use client";

import { AudioControls } from "@/components/AudioControls";
import { ChatInterface } from "@/components/ChatInterface";
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
import { ElevenLabsMusic } from "@/lib/elevenlabsMusic";
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
}

// Map mood types to color pairs for the Orb
function getMoodColors(_meditationType: string): [string, string] {
  // Gray tones for all moods
  return ["#9ca3af", "#6b7280"]; // Light gray to darker gray
}

export default function MeditationPage() {
  const router = useRouter();
  const createSession = useMutation(api.meditation.createSession);
  const userProfile = useQuery(api.userProfile.getProfile);

  const [moodProfile, setMoodProfile] = useState<MoodProfile | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [isMusicGenerating, setIsMusicGenerating] = useState(false);
  const sessionStartedRef = useRef(false);
  const musicGeneratorRef = useRef<ElevenLabsMusic | null>(null);

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
      if (now - lastUpdateRef.current < 33) { // 33ms = ~30fps
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

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      if (musicGeneratorRef.current) {
        musicGeneratorRef.current.stop();
      }
    };
  }, []);

  // Start session when ready (only once)
  useEffect(() => {
    if (moodProfile && userProfile && !isConnected && !sessionStartedRef.current) {
      sessionStartedRef.current = true;
      startSession();
      
      // Start background music
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      if (apiKey && moodProfile) {
        const musicGenerator = new ElevenLabsMusic({
          apiKey,
          mood: moodProfile.meditationType || "general-wellness",
          moodSummary: moodProfile.summary,
        });
        
        musicGeneratorRef.current = musicGenerator;
        setIsMusicGenerating(true);
        
        // Start generating and playing music (async, non-blocking)
        musicGenerator.generateAndPlay()
          .then(() => {
            setIsMusicGenerating(false);
          })
          .catch((error) => {
            console.warn("Background music generation failed:", error);
            setIsMusicGenerating(false);
            // Continue without music
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moodProfile, userProfile]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    togglePlayPause();
    
    // Control music playback
    if (musicGeneratorRef.current) {
      if (isPlaying) {
        musicGeneratorRef.current.pause();
      } else {
        musicGeneratorRef.current.resume();
      }
    }
  };

  const handleVolumeChange = (volume: number) => {
    // Control music volume
    if (musicGeneratorRef.current) {
      musicGeneratorRef.current.setVolume(volume);
    }
  };

  const handleStop = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = async () => {
    setIsSaving(true);

    try {
      // Stop background music
      if (musicGeneratorRef.current) {
        await musicGeneratorRef.current.stop();
        musicGeneratorRef.current = null;
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0c2234] to-[#0d3d3d] flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0c2234] to-[#0d3d3d] relative overflow-hidden">
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
          <p className="text-2xl font-mono text-teal-400">{formatTime(sessionDuration)}</p>
        </div>
      </motion.div>

      {/* Music Loading Indicator */}
      {isMusicGenerating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-full px-6 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <p className="text-sm text-slate-300">Generating soundscape...</p>
          </div>
        </motion.div>
      )}

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
        onToggleChat={() => setShowChat(!showChat)}
        showChat={showChat}
        onVolumeChange={handleVolumeChange}
      />

      {/* Chat Interface */}
      <ChatInterface messages={messages} isOpen={showChat} onClose={() => setShowChat(false)} />

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
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {sessionSaved ? "Session Complete" : "End Meditation Session?"}
            </DialogTitle>
            {sessionSaved ? (
              <div className="flex items-center gap-2 text-teal-400 text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Your session has been saved successfully</span>
              </div>
            ) : (
              <DialogDescription className="text-slate-400">
                You&apos;ve meditated for {formatTime(sessionDuration)}. Your session will be saved.
              </DialogDescription>
            )}
          </DialogHeader>
          {!sessionSaved && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowExitDialog(false)}
                disabled={isSaving}
                className="border-slate-600"
              >
                Continue
              </Button>
              <Button
                onClick={handleConfirmExit}
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-500"
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
          <div className="bg-red-900/80 border border-red-700 rounded-lg px-6 py-3 backdrop-blur-sm">
            <p className="text-red-100 text-sm">Connection error: {error.message}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

