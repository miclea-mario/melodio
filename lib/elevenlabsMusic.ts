export interface MusicGenerationConfig {
  apiKey: string;
  mood: string;
  moodSummary: string;
}

export class ElevenLabsMusic {
  private config: MusicGenerationConfig;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentBlobUrl: string | null = null;
  private isGenerating: boolean = false;

  constructor(config: MusicGenerationConfig) {
    this.config = config;
  }

  private getMusicPrompt(): string {
    // Create music prompts based on mood
    const moodPrompts: Record<string, string> = {
      "stress-relief": "Calming ambient meditation music with soft nature sounds, gentle water streams, and peaceful forest atmosphere. Slow tempo, soothing instrumental.",
      "anxiety-reduction": "Peaceful ambient soundscape with soft piano, gentle wind chimes, and serene atmosphere. Calming and grounding instrumental meditation music.",
      "sleep": "Deep sleep ambient music with soft drones, gentle ocean waves, and tranquil night sounds. Ultra-calming instrumental for deep relaxation.",
      "focus": "Focused ambient music with subtle rhythmic elements, soft bells, and clear meditative tones. Concentration-enhancing instrumental.",
      "general-wellness": "Serene meditation music with nature sounds, gentle harmonies, and peaceful ambiance. Balanced and calming instrumental.",
      "default": "Peaceful meditation music with soft ambient tones, gentle nature sounds, and calming harmonies. Relaxing instrumental soundscape.",
    };

    const prompt = moodPrompts[this.config.mood] || moodPrompts.default;
    
    // Add mood summary context for more personalized music
    return `${prompt} Context: ${this.config.moodSummary.substring(0, 200)}`;
  }

  async generateAndPlay(): Promise<void> {
    if (this.isGenerating || this.isPlaying) {
      return;
    }

    this.isGenerating = true;

    try {
      const prompt = this.getMusicPrompt();
      console.log("🎵 Generating meditation music:", this.config.mood);

      // Generate 60 seconds of music (will loop)
      const response = await fetch(
        "https://api.elevenlabs.io/v1/music/stream?output_format=mp3_44100_128",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": this.config.apiKey,
          },
          body: JSON.stringify({
            prompt: prompt,
            music_length_ms: 60000, // 60 seconds
            model_id: "music_v1",
            force_instrumental: true, // Always instrumental for meditation
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Music generation failed: ${response.statusText}`);
      }

      // Convert stream to blob
      const blob = await response.blob();
      
      // Clean up previous blob URL
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
      }

      // Create new blob URL
      this.currentBlobUrl = URL.createObjectURL(blob);

      // Create or reuse audio element
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.loop = true; // Loop the music
        this.audioElement.volume = 0.3; // Lower volume for background music
        
        // Preload for smooth playback
        this.audioElement.preload = "auto";
      }

      this.audioElement.src = this.currentBlobUrl;

      // Play the music
      await this.audioElement.play();
      this.isPlaying = true;
      
      console.log("✅ Meditation music playing");
    } catch (error) {
      console.error("Error generating meditation music:", error);
      // Don't throw - meditation should continue even if music fails
    } finally {
      this.isGenerating = false;
    }
  }

  async stop(): Promise<void> {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.isPlaying = false;
    }

    // Clean up blob URL
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }

    console.log("🎵 Meditation music stopped");
  }

  setVolume(volume: number): void {
    if (this.audioElement) {
      // Keep background music quieter than voice (0-0.5 range)
      this.audioElement.volume = Math.min(volume * 0.5, 0.5);
    }
  }

  pause(): void {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }

  resume(): void {
    if (this.audioElement && !this.isPlaying) {
      this.audioElement.play().catch((error) => {
        console.warn("Could not resume music:", error);
      });
      this.isPlaying = true;
    }
  }

  isActive(): boolean {
    return this.isPlaying;
  }
}

