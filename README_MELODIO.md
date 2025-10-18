# Melodio - AI-Powered Meditation Web App

An immersive meditation experience featuring AI-driven mood profiling, real-time voice-guided meditation with ElevenLabs, and a reactive visual Meditation ORB that responds to audio energy.

## Features

- **AI Mood Profiling**: Dynamic questionnaire using OpenAI to understand your emotional state
- **Personalized Sessions**: User profiles with name, gender, and occupation for tailored guidance
- **ElevenLabs Voice Agent**: Real-time AI voice guidance with ambient soundscapes
- **Reactive Meditation ORB**: Beautiful audio visualization using Web Audio API
- **Session Tracking**: Save and review your meditation history
- **Dark Forest Theme**: Immersive night forest aesthetic with smooth animations

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Backend**: Convex.dev for real-time database and serverless functions
- **UI**: Shadcn/ui components, Tailwind CSS v4
- **Animations**: Framer Motion
- **AI**: OpenAI GPT-4 for mood analysis, ElevenLabs for voice agent
- **Auth**: Convex Auth

## Prerequisites

- Node.js 20+ and npm
- Convex account ([convex.dev](https://convex.dev))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))
- ElevenLabs API key ([elevenlabs.io](https://elevenlabs.io))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd melodio
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI API Key for mood profiling
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key for voice agent
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ElevenLabs Agent ID (already configured)
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_5301k7s1cq5hekm8jtrx4tqq2mjy
```

### 3. Configure ElevenLabs Agent

The agent ID `agent_5301k7s1cq5hekm8jtrx4tqq2mjy` should have its system prompt configured in the ElevenLabs dashboard to use dynamic variables:

```
You are a compassionate meditation guide helping {{user_name}} find inner peace.

User Context:
- Name: {{user_name}}
- Gender: {{user_gender}}
- Occupation: {{user_occupation}}

Current Mood Assessment:
{{mood_summary}}

Instructions:
- Provide gentle, personalized meditation guidance
- Reference their occupation when discussing work-related stress
- Adapt your language based on their mood and emotional state
- Generate calming ambient soundscapes along with your voice guidance
- Keep sessions between 5-20 minutes unless they request longer
- Use their name occasionally to create connection
- Speak slowly and calmly with natural pauses
```

### 4. Set Up Convex

```bash
# Login to Convex
npx convex dev

# This will:
# - Create a new Convex project (or link existing)
# - Set up the database schema
# - Deploy functions
# - Start the development server
```

### 5. Configure Convex Auth

Follow the Convex Auth setup:

1. Go to your Convex dashboard
2. Navigate to Settings > Environment Variables
3. Add your OAuth providers or use email/password auth

### 6. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## User Flow

1. **Sign In**: Authenticate using Convex Auth
2. **Profile Setup**: First-time users enter name, gender (optional), occupation (optional)
3. **Home Dashboard**: View stats and session history
4. **Start Meditation**: Click "Start Meditation"
5. **Mood Profiling**: Answer 4 AI-generated questions about your current emotional state
6. **Meditation Session**:
   - Watch the reactive ORB pulse with the agent's voice
   - Use audio controls to play/pause
   - Toggle chat to see conversation transcripts
   - View session timer
7. **Session Complete**: Session automatically saves to your history

## Project Structure

```
melodio/
├── app/
│   ├── page.tsx                    # Home/dashboard
│   ├── profile-setup/page.tsx      # User profile setup
│   ├── mood-profiling/page.tsx     # AI mood questionnaire
│   ├── meditation/page.tsx         # Main meditation session
│   └── globals.css                 # Global styles & animations
├── components/
│   ├── MeditationOrb.tsx          # Canvas-based audio visualization
│   ├── MoodCard.tsx               # Mood option card
│   ├── AudioControls.tsx          # Play/pause/stop controls
│   ├── ChatInterface.tsx          # Conversation transcript panel
│   └── SessionHistory.tsx         # Past sessions display
├── convex/
│   ├── schema.ts                  # Database schema
│   ├── meditation.ts              # Meditation functions
│   ├── userProfile.ts             # Profile management
│   └── auth.ts                    # Auth configuration
├── lib/
│   ├── elevenlabs.ts              # ElevenLabs integration
│   └── audioAnalyzer.ts           # Web Audio API utilities
└── hooks/
    ├── useElevenLabsSession.ts    # ElevenLabs session management
    └── useAudioAnalyzer.ts        # Audio analysis hook
```

## Database Schema

### userProfiles

- `userId`: User ID reference
- `name`: User's name
- `gender`: Optional gender
- `occupation`: Optional occupation
- `profileCompleted`: Boolean flag

### sessions

- `userId`: User ID reference
- `mood`: Primary mood/emotion
- `moodProfile`: Object with questions, answers, and AI summary
- `duration`: Session length in seconds
- `timestamp`: Unix timestamp
- `meditationType`: Type of meditation (stress-relief, anxiety-reduction, etc.)

## Customization

### Colors

Edit the color scheme in `app/globals.css`:

- Primary: `#1a4d4d` (teal)
- Background: `#0a1628` to `#0d3d3d` (gradient)
- Accent: `#4ade80` (soft green glow)

### ORB Visualization

Modify `components/MeditationOrb.tsx`:

- Adjust `getMoodHue()` for different mood colors
- Change amplitude scaling in line 61
- Customize particle effects starting at line 100

### Mood Questions

The AI generates questions dynamically, but you can adjust the prompt in `convex/meditation.ts` in the `generateMoodQuestion` action.

## Troubleshooting

### "Failed to load question"

- Check that your `OPENAI_API_KEY` is set correctly in `.env.local`
- Ensure you have API credits in your OpenAI account
- Restart the dev server after changing environment variables

### "Connection error" with ElevenLabs

- Verify `ELEVENLABS_API_KEY` is correct
- Check that the agent ID exists in your ElevenLabs account
- Ensure your browser supports WebSocket connections

### Audio visualization not working

- Check browser console for Web Audio API errors
- Ensure the audio stream is properly connected
- Try a different browser (Chrome/Edge recommended)

### Profile not saving

- Check Convex dashboard for function errors
- Ensure you're authenticated
- Check browser console for errors

## Development Notes

### ElevenLabs Integration

The current implementation in `lib/elevenlabs.ts` is a placeholder showing the structure. To fully integrate:

1. Install the official SDK: `npm install @elevenlabs/client`
2. Follow the [ElevenLabs Conversational AI docs](https://elevenlabs.io/docs/agents-platform/quickstart)
3. Replace the placeholder with actual Conversation API calls
4. Connect the audio stream to the Web Audio API analyzer

### Testing Without APIs

You can test the UI flow without API keys by:

- Commenting out the OpenAI calls in `convex/meditation.ts`
- Returning mock data for questions and analysis
- Using placeholder audio for visualization

## Performance Optimization

- Canvas rendering runs at 60fps using `requestAnimationFrame`
- Audio analysis uses smoothing to prevent jarring movements
- Convex queries are cached and reactive
- Images and assets should be optimized for web

## Security

- API keys are stored in environment variables (never in code)
- All sensitive data is scoped to authenticated users
- Convex handles authentication and authorization
- Session data is private per user

## Future Enhancements

- [ ] Add more meditation types (sleep, focus, energy)
- [ ] Implement session replay functionality
- [ ] Add meditation streaks and achievements
- [ ] Export session data/analytics
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support
- [ ] Custom soundscape selection
- [ ] Integration with wearables for biofeedback

## Support

For issues or questions:

- Check the troubleshooting section above
- Review Convex docs: https://docs.convex.dev
- ElevenLabs docs: https://elevenlabs.io/docs
- Open an issue in the repository

## License

This project is private and proprietary.

---

Built with ❤️ using Next.js, Convex, and ElevenLabs
