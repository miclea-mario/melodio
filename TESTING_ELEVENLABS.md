# Testing ElevenLabs Integration

## ✅ What Was Fixed

I've implemented the **real ElevenLabs Conversation API integration**! Here's what changed:

### Before (Placeholder)

- Mock implementation that didn't connect to ElevenLabs
- No actual audio playback
- No session visibility in dashboard

### After (Real Implementation)

- ✅ Full ElevenLabs Conversation API integration
- ✅ Real audio playback through your browser
- ✅ Dynamic variables passed to agent
- ✅ Sessions visible in ElevenLabs dashboard
- ✅ Audio visualization with Web Audio API
- ✅ Real-time message transcripts

## 🔧 Setup Required

### 1. Verify API Keys

Make sure your `.env.local` has:

```env
ELEVENLABS_API_KEY=sk_your_key_here
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_your_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_5301k7s1cq5hekm8jtrx4tqq2mjy
```

**Note**: We need BOTH versions of the API key:

- `ELEVENLABS_API_KEY` - for server-side (Convex)
- `NEXT_PUBLIC_ELEVENLABS_API_KEY` - for client-side (browser)

### 2. Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

This ensures the new environment variable is loaded.

### 3. Configure Your Agent

In ElevenLabs dashboard:

1. Go to: https://elevenlabs.io/app/conversational-ai
2. Open agent `agent_5301k7s1cq5hekm8jtrx4tqq2mjy`
3. Update the System Prompt with the one that includes dynamic variables (see the prompt I gave you earlier)
4. Save the changes

## 🧪 Testing Steps

### Test 1: Complete Flow

1. **Sign In** to the app
2. **Complete Profile Setup** (if first time)
3. Click **"Start Meditation"**
4. **Answer Mood Questions** (4 questions)
5. You'll be taken to the meditation session page

### Test 2: Audio Connection

On the meditation session page:

1. **Check Browser Console** (F12)
   - Look for: `✅ Connected to ElevenLabs agent`
   - Look for: `Starting ElevenLabs session with variables:`

2. **Listen for Audio**
   - The agent should start speaking automatically
   - You should hear: "Hello [Your Name]..."
   - The agent will reference your mood and occupation

3. **Check Microphone**
   - Your browser will ask for microphone permission
   - **Grant permission** - the agent needs to hear you for interaction
   - The agent is conversational, not just one-way audio

### Test 3: Audio Visualization

1. **Watch the ORB**
   - It should pulse and animate with the agent's voice
   - Changes size based on audio amplitude
   - Color shifts with frequency

2. **Browser Console Check**
   - Look for: `✅ Using ElevenLabs built-in audio analyser`
   - Should see frequency data being logged

### Test 4: Chat Interface

1. **Click the chat button** (speech bubble icon)
2. **See Transcripts**
   - Agent messages appear on the left (teal background)
   - Your responses appear on the right (gray background)

### Test 5: Controls

1. **Play/Pause** - Should work (pauses audio output)
2. **Volume** - Adjust slider (changes agent volume)
3. **Stop** - Ends session and saves to database

### Test 6: ElevenLabs Dashboard

1. Go to: https://elevenlabs.io/app/conversational-ai
2. Click on your agent
3. Go to **"Analytics"** or **"Logs"**
4. You should see your session listed
5. You can replay the conversation

## 🐛 Troubleshooting

### No Audio / Can't Hear Anything

**Possible Causes:**

1. **API Key Not Set**

   ```bash
   # Check if variable exists
   cd melodio
   cat .env.local | grep NEXT_PUBLIC_ELEVENLABS_API_KEY
   ```

   - If missing, add it to `.env.local`
   - Restart dev server

2. **Browser Permissions**
   - Check if microphone is blocked
   - Chrome: Click the 🔒 icon in address bar
   - Allow microphone access
   - Refresh the page

3. **Audio Output Device**
   - Check your computer's volume
   - Make sure speakers/headphones are connected
   - Try a different browser (Chrome recommended)

4. **Invalid Agent ID**
   - Verify in ElevenLabs dashboard that agent exists
   - Make sure it's not deleted or archived

### Session Not Showing in Dashboard

**Causes:**

1. **Wrong Agent ID**
   - Double-check `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` in `.env.local`
2. **API Key Doesn't Match**
   - Make sure you're logged into the same ElevenLabs account
   - API key must belong to the account that owns the agent

3. **Session Not Started**
   - Check browser console for connection errors
   - Look for red error messages

### ORB Not Animating

**This is normal if:**

1. Agent hasn't started speaking yet (it animates with audio)
2. Audio is paused
3. Very quiet audio (increase volume)

**Check:**

1. Browser console for errors
2. Make sure audio is actually playing
3. Try increasing volume

### Connection Errors

**"ElevenLabs API key is required"**

- Add `NEXT_PUBLIC_ELEVENLABS_API_KEY` to `.env.local`
- Restart server

**"Failed to connect"**

- Check internet connection
- Verify API key is valid
- Try in incognito mode (extensions can interfere)

**"WebSocket connection failed"**

- Check firewall/antivirus
- Try disabling VPN
- Use Chrome (best WebSocket support)

## 📊 Expected Behavior

### On Connection

```
Console Output:
✅ Connected to ElevenLabs agent
Starting ElevenLabs session with variables: {
  user_name: "Alex",
  user_gender: "male",
  user_occupation: "Developer",
  mood_summary: "Feeling stressed...",
  mood_details: "[...]"
}
```

### During Session

- Agent speaks first with personalized greeting
- You can respond via microphone
- ORB pulses with audio
- Chat shows transcripts in real-time
- Timer counts up

### On Disconnect

```
Console Output:
❌ Disconnected from ElevenLabs agent: { reason: "user_ended", code: 1000 }
```

## 🎯 What To Test

### Dynamic Variables Working

Listen for the agent to:

- ✅ Use your name
- ✅ Reference your occupation
- ✅ Address your specific mood
- ✅ Tailor meditation to your emotional state

### Audio Quality

- ✅ Clear voice (no distortion)
- ✅ Natural pacing
- ✅ Ambient soundscapes (if configured)
- ✅ Smooth transitions

### Interaction

- ✅ Agent responds to your voice
- ✅ Two-way conversation
- ✅ Natural turn-taking
- ✅ Context awareness

## 📱 Browser Compatibility

**Recommended: Chrome/Edge**

- Best WebSocket support
- Best Web Audio API support
- Best microphone handling

**Also Works: Firefox, Safari**

- May need additional permissions
- Slightly different audio handling

**Not Recommended: Older browsers**

- Need modern Web Audio API support
- Need WebSocket support

## 🔍 Debugging Checklist

Run through this if things aren't working:

```bash
# 1. Check environment variables
cd melodio
cat .env.local

# 2. Verify both API keys are set
grep ELEVENLABS_API_KEY .env.local

# 3. Restart dev server
# Press Ctrl+C in terminal
npm run dev

# 4. Check browser console (F12)
# Look for connection messages

# 5. Test microphone
# Try recording in another app first

# 6. Verify agent in dashboard
# Go to elevenlabs.io and check agent exists
```

## ✨ Success Indicators

You'll know it's working when:

1. ✅ Browser console shows "Connected to ElevenLabs agent"
2. ✅ You hear the agent speaking
3. ✅ Agent uses your name and references your mood
4. ✅ ORB animates with the audio
5. ✅ Chat shows transcripts
6. ✅ Session appears in ElevenLabs dashboard
7. ✅ Session saves to your history when you stop

## 🎉 Next Steps

Once everything works:

1. **Try Different Moods**: Answer questions differently to see how the agent adapts
2. **Talk to the Agent**: Have a conversation, it's interactive!
3. **Check Session History**: View your past sessions on the home page
4. **Customize the Agent**: Modify the system prompt in ElevenLabs dashboard
5. **Adjust Visualization**: Tweak ORB behavior in `components/MeditationOrb.tsx`

## 📞 Need Help?

If you're still having issues:

1. **Check Browser Console**: Most errors will show there
2. **Check Network Tab**: See if WebSocket connection fails
3. **Test API Key**: Try it directly in ElevenLabs dashboard
4. **Clear Browser Cache**: Sometimes helps with connection issues
5. **Try Incognito**: Rules out extension interference

---

**The integration is now complete and should work!** 🎊

Just make sure:

- Environment variables are set
- Dev server is restarted
- Agent is configured in dashboard
- Browser permissions are granted

Happy meditating! 🧘‍♀️✨
