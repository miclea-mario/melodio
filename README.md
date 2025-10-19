# Melodio 🪷

> **Winner: Best Project Built with ElevenLabs**  
> Cursor Hackathon Bucharest, 2025

An immersive AI-powered meditation app that combines real-time voice guidance, personalized mood profiling, and reactive audio visualization to create deeply personalized meditation experiences.

## 🏆 Hackathon Project

Built during the **Cursor Hackathon Bucharest** by:
- [@miclea-mario](https://github.com)
- [@brobert1](https://github.com/brobert1)
- [@DanniTSC](https://github.com/DanniTSC)

## ✨ Features

- **AI Mood Profiling**: Dynamic questionnaire using OpenAI GPT-4 to understand your emotional state
- **Personalized Meditation**: Real-time voice guidance powered by ElevenLabs Conversational AI
- **Reactive Meditation Orb**: Beautiful audio visualization that pulses and responds to voice guidance using Web Audio API
- **Session Tracking**: Save and review your complete meditation history
- **User Profiles**: Personalized experience based on your name, occupation, and emotional state
- **Immersive UI**: Dark forest theme with smooth animations and glassmorphism effects

## 🎯 How It Works

1. **Sign In** → Authenticate securely with Convex Auth
2. **Set Up Profile** → Tell us your name, occupation (optional)
3. **Mood Check-In** → Answer 4 AI-generated questions about your current state
4. **Meditate** → Experience personalized voice guidance while watching the reactive meditation orb
5. **Track Progress** → View your meditation history and statistics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (real-time database & serverless functions)
- **AI**: OpenAI GPT-4 (mood analysis), ElevenLabs Conversational AI (voice guidance)
- **Visualization**: Web Audio API, Canvas API
- **UI**: Tailwind CSS v4, Shadcn/ui, Framer Motion
- **Auth**: Convex Auth

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Convex account ([convex.dev](https://convex.dev))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))
- ElevenLabs API key ([elevenlabs.io](https://elevenlabs.io))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
# Create .env.local and add your API keys:
# OPENAI_API_KEY=your_key_here
# ELEVENLABS_API_KEY=your_key_here
# NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id

# Start the app
npm run dev
```

Visit `http://localhost:3000` to start your meditation journey!

## 📁 Project Structure

```
melodio/
├── app/                      # Next.js app router pages
│   ├── page.tsx             # Dashboard with session history
│   ├── profile-setup/       # User profile setup flow
│   ├── mood-profiling/      # AI mood questionnaire
│   └── meditation/          # Meditation session with orb
├── components/              # React components
│   ├── MeditationOrb.tsx   # Audio-reactive visualization
│   ├── ChatInterface.tsx    # Conversation transcript
│   └── ui/                  # Shadcn UI components
├── convex/                  # Backend functions & schema
│   ├── schema.ts           # Database tables
│   ├── meditation.ts       # Mood profiling & sessions
│   └── userProfile.ts      # User management
├── lib/                     # Utilities
│   ├── elevenlabs.ts       # ElevenLabs integration
│   └── audioAnalyzer.ts    # Web Audio API utilities
└── hooks/                   # Custom React hooks
```

## 🎨 Key Technologies

### ElevenLabs Integration
Real-time conversational AI that provides personalized meditation guidance. The agent receives dynamic context including:
- User's name, occupation
- Current mood analysis from AI questionnaire
- Previous conversation history

### AI Mood Profiling
Dynamic questionnaire where each question adapts based on previous answers, powered by OpenAI GPT-4 to create deeply personalized meditation sessions.

---

Built with ❤️ at Cursor Hackathon Bucharest using Next.js, Convex, OpenAI, and ElevenLabs
