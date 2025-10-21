import { Conversation } from "@elevenlabs/client";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

export interface UserProfile {
  name: string;
  gender?: string;
  occupation?: string;
}

export interface MoodData {
  summary: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface ElevenLabsConfig {
  agentId: string;
  convexUrl: string;
  userProfile: UserProfile;
  moodData: MoodData;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: string, isAgent: boolean) => void;
  onAudioStream?: (audioData: Float32Array) => void;
  onModeChange?: (mode: { mode: string }) => void;
}

export class ElevenLabsSession {
  private conversation: Conversation | null = null;
  private config: ElevenLabsConfig;
  private animationFrameId: number | null = null;
  private convexClient: ConvexHttpClient;

  constructor(config: ElevenLabsConfig) {
    this.config = config;
    this.convexClient = new ConvexHttpClient(config.convexUrl);
  }

  async start() {
    try {
      // Prepare dynamic variables
      const dynamicVariables = {
        user_name: this.config.userProfile.name,
        user_gender: this.config.userProfile.gender || "not specified",
        user_occupation: this.config.userProfile.occupation || "not specified",
        mood_summary: this.config.moodData.summary,
        mood_details: JSON.stringify(this.config.moodData.questions),
      };

      console.log(
        "Starting ElevenLabs session with variables:",
        dynamicVariables,
      );

      // Get a signed URL for WebSocket connection via Convex
      console.log(`Requesting signed URL for agent: ${this.config.agentId}`);

      const signedUrlData = await this.convexClient.action(
        api.elevenlabs.getSignedUrl,
        {
          agentId: this.config.agentId,
        },
      );

      const { signed_url } = signedUrlData;

      // Start the conversation with signed URL
      this.conversation = await Conversation.startSession({
        signedUrl: signed_url,
        // Pass dynamic variables at the top level
        dynamicVariables: dynamicVariables,
        onConnect: () => {
          console.log("✅ Connected to ElevenLabs agent");
          this.config.onConnect?.();
        },
        onDisconnect: (details) => {
          console.log("❌ Disconnected from ElevenLabs agent:", details);
          this.config.onDisconnect?.();
          this.stopAudioAnalysis();
        },
        onError: (error) => {
          console.error("ElevenLabs error:", error);
          this.config.onError?.(new Error(String(error)));
        },
        onMessage: (props) => {
          console.log("Message:", props);
          const isAgent = props.source === "ai";
          this.config.onMessage?.(props.message, isAgent);
        },
        onModeChange: (mode) => {
          console.log("Mode changed:", mode);
          this.config.onModeChange?.(mode);
        },
      });

      // Set up audio stream for visualization
      await this.setupAudioVisualization();

      return true;
    } catch (error) {
      console.error("Error starting ElevenLabs session:", error);
      this.config.onError?.(error as Error);
      return false;
    }
  }

  private async setupAudioVisualization() {
    try {
      if (!this.conversation) {
        return;
      }

      // The ElevenLabs SDK handles audio output internally
      // We just need to read from its built-in analyser for visualization
      // DO NOT connect to audioContext.destination - that would play audio twice!

      const outputAnalyser = this.conversation.getOutputByteFrequencyData();

      if (outputAnalyser) {
        // Use the conversation's built-in analyser for visualization
        console.log("✅ Using ElevenLabs built-in audio analyser");

        // Start visualization loop using the built-in analyser
        this.startAudioAnalysisFromOutput();
      } else {
        console.warn("Could not access audio output analyser");
      }
    } catch (error) {
      console.warn("Could not set up audio visualization:", error);
      // Don't fail the session if visualization fails
    }
  }

  private startAudioAnalysisFromOutput() {
    if (!this.conversation || !this.config.onAudioStream) {
      return;
    }

    const analyze = () => {
      if (!this.conversation) return;

      try {
        // Get frequency data from conversation output
        const frequencyData = this.conversation.getOutputByteFrequencyData();

        if (frequencyData && frequencyData.length > 0) {
          // Convert Uint8Array to Float32Array for consistency
          const floatData = new Float32Array(frequencyData.length);
          for (let i = 0; i < frequencyData.length; i++) {
            floatData[i] = (frequencyData[i] / 255) * 2 - 1; // Normalize to -1 to 1
          }

          this.config.onAudioStream?.(floatData);
        }
      } catch {
        // Silently continue if there's an error reading audio data
      }

      this.animationFrameId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  private stopAudioAnalysis() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  async stop() {
    try {
      this.stopAudioAnalysis();

      if (this.conversation) {
        await this.conversation.endSession();
        this.conversation = null;
      }

      // No need to clean up audioContext or analyserNode
      // as we're using the SDK's built-in audio handling

      this.config.onDisconnect?.();
    } catch (error) {
      console.error("Error stopping ElevenLabs session:", error);
      this.config.onError?.(error as Error);
    }
  }

  async setVolume(volume: number) {
    // ElevenLabs SDK volume control
    if (this.conversation) {
      try {
        this.conversation.setVolume({ volume });
      } catch (error) {
        console.warn("Volume control error:", error);
      }
    }
  }

  isActive(): boolean {
    return this.conversation !== null;
  }
}
