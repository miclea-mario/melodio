# Melodio Quick Start Guide

Get your AI meditation app running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- npm or yarn
- A code editor

## Step 1: Install Dependencies (1 minute)

```bash
cd melodio
npm install
```

## Step 2: Set Up Convex (2 minutes)

```bash
# Start Convex development server
npx convex dev
```

This will:

1. Ask you to log in to Convex (create account if needed)
2. Create a new project or link to existing one
3. Deploy your schema and functions
4. Give you a deployment URL

**Keep this terminal running!**

## Step 3: Configure Environment Variables (1 minute)

Create `.env.local` in the project root:

```env
# Required for mood profiling
OPENAI_API_KEY=sk-your-openai-key-here

# Required for voice agent (optional for initial testing)
ELEVENLABS_API_KEY=your-elevenlabs-key-here

# Agent ID (pre-configured)
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_5301k7s1cq5hekm8jtrx4tqq2mjy
```

### Where to Get API Keys:

**OpenAI** (Required for mood profiling):

1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to API Keys section
4. Create new secret key
5. Copy and paste into `.env.local`

**ElevenLabs** (Optional - for voice agent):

1. Go to https://elevenlabs.io
2. Sign up or log in
3. Go to Profile > API Keys
4. Copy your API key
5. Paste into `.env.local`

## Step 4: Start Development Server (1 minute)

Open a **new terminal** (keep Convex running) and run:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Step 5: Test the App

### First Run:

1. **Sign In**: Click sign in and create an account (or use the demo)
2. **Profile Setup**: Enter your name (required), gender and occupation (optional)
3. **Home Page**: You'll see the landing page with "Start Meditation" button

### Test Mood Profiling:

1. Click **"Start Meditation"**
2. Answer 4 AI-generated questions about your mood
3. The AI will analyze your responses
4. You'll be redirected to the meditation session

### Test Meditation Session:

1. See the **Meditation ORB** pulsing in the center
2. Use the **audio controls** at the bottom:
   - Play/Pause button
   - Stop button
   - Volume slider
   - Chat toggle
3. Click **Stop** to end and save the session
4. Your session will appear in the history on the home page

## Troubleshooting

### "Failed to load question" Error

**Cause**: OpenAI API key not set or invalid

**Fix**:

1. Check `.env.local` has `OPENAI_API_KEY=sk-...`
2. Verify the key is valid at https://platform.openai.com
3. Restart dev server: Press Ctrl+C and run `npm run dev` again

### Convex Connection Error

**Cause**: Convex dev server not running

**Fix**:

1. Ensure `npx convex dev` is running in a separate terminal
2. Check for errors in the Convex terminal
3. Try running `npx convex dev --once` to reset

### "Not authenticated" Error

**Cause**: Need to sign in

**Fix**:

1. Click the sign-in link
2. Create an account or sign in
3. Complete the profile setup

### Audio Visualization Not Working

**Cause**: ElevenLabs not fully implemented yet

**Note**: The audio visualization structure is complete but requires ElevenLabs Conversation API integration. For now, the ORB will pulse with simulated data.

## Testing Without API Keys

You can test the UI flow without API keys:

1. Comment out OpenAI calls in `convex/meditation.ts`:

```typescript
// In generateMoodQuestion action, replace the fetch with:
return {
  question: "How are you feeling right now?",
  options: ["Stressed", "Calm", "Anxious", "Energized"],
};

// In analyzeMoodProfile action, replace the fetch with:
return {
  summary: "You seem to be experiencing mixed emotions.",
  themes: ["stress", "work-life balance"],
  meditationType: "stress-relief",
};
```

2. Restart Convex: Press Ctrl+C in the Convex terminal, then run `npx convex dev` again

## Next Steps

### 1. Customize the Experience

- **Colors**: Edit `app/globals.css` to change the theme
- **Questions**: Modify prompts in `convex/meditation.ts`
- **ORB Behavior**: Adjust `components/MeditationOrb.tsx`

### 2. Configure ElevenLabs Agent

Follow `ELEVENLABS_SETUP.md` to:

1. Set up your agent in ElevenLabs dashboard
2. Configure system prompt with dynamic variables
3. Test the voice agent

### 3. Implement Full ElevenLabs Integration

See `IMPLEMENTATION_SUMMARY.md` section "ElevenLabs Full Integration" for code examples.

### 4. Deploy to Production

```bash
# Build the app
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod
```

Don't forget to:

- Add environment variables in your hosting platform
- Set Convex to production mode
- Configure your custom domain

## Development Tips

### Hot Reload

Both Next.js and Convex support hot reload:

- Save any file and see changes instantly
- Convex functions auto-deploy when saved
- React components update without page refresh

### Viewing Data

Check your Convex data:

1. Go to https://dashboard.convex.dev
2. Select your project
3. Click "Data" to see tables
4. View `userProfiles` and `sessions` tables

### Debugging

- **Client Errors**: Check browser console (F12)
- **Server Errors**: Check Convex terminal output
- **API Errors**: Check Next.js terminal output

## Common Commands

```bash
# Start both Convex and Next.js
npm run dev

# Just Convex
npx convex dev

# Just Next.js
npm run dev:frontend

# Build for production
npm run build

# Run linter
npm run lint

# Clear Convex cache
npx convex dev --clear
```

## Support Resources

- **Convex Docs**: https://docs.convex.dev
- **Next.js Docs**: https://nextjs.org/docs
- **ElevenLabs Docs**: https://elevenlabs.io/docs
- **OpenAI Docs**: https://platform.openai.com/docs

## Quick Architecture Overview

```
User Flow:
Sign In → Profile Setup → Home → Mood Profiling → Meditation Session → History

Data Flow:
Frontend (Next.js) ↔ Convex (Database + Functions) ↔ External APIs (OpenAI, ElevenLabs)

Key Files:
- app/page.tsx → Home page
- app/mood-profiling/page.tsx → AI questionnaire
- app/meditation/page.tsx → Session with ORB
- convex/meditation.ts → AI functions
- components/MeditationOrb.tsx → Audio visualization
```

## Success Checklist

- [ ] Convex dev server running
- [ ] Next.js dev server running
- [ ] Can sign in and create account
- [ ] Can complete profile setup
- [ ] Can view home page
- [ ] Can answer mood questions
- [ ] Can see meditation session
- [ ] Session saves to history
- [ ] Can view past sessions

## You're All Set! 🎉

Your Melodio app is now running locally. Start by clicking "Start Meditation" and experience the AI-powered mood profiling flow!

For detailed documentation, see:

- `README_MELODIO.md` - Complete setup guide
- `ELEVENLABS_SETUP.md` - Voice agent configuration
- `IMPLEMENTATION_SUMMARY.md` - Technical details

Happy meditating! 🧘‍♀️✨
