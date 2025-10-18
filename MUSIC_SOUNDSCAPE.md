# 🎵 Ambient Soundscape Feature

## Overview

Melodio now generates **AI-powered ambient music** that plays continuously in the background during meditation sessions using ElevenLabs' Music Generation API.

## ✅ What Was Added

### New Module: `lib/elevenlabsMusic.ts`

A complete music generation and playback system that:

- ✅ Generates mood-specific ambient music using ElevenLabs Music API
- ✅ Creates 60-second looping instrumental tracks
- ✅ Automatically starts when meditation session begins
- ✅ Plays at 30% volume (quieter than voice agent)
- ✅ Controlled by audio controls (play/pause/volume)
- ✅ Stops when session ends

### Mood-Specific Prompts

The system generates different soundscapes based on mood type:

| Mood Type             | Music Description                                                  |
| --------------------- | ------------------------------------------------------------------ |
| **stress-relief**     | Calming ambient with nature sounds, water streams, peaceful forest |
| **anxiety-reduction** | Peaceful ambient with soft piano, wind chimes, serene atmosphere   |
| **sleep**             | Deep sleep ambient with soft drones, ocean waves, night sounds     |
| **focus**             | Focused ambient with subtle rhythms, soft bells, meditative tones  |
| **general-wellness**  | Serene meditation with nature sounds, gentle harmonies             |

### Integration

The music system is fully integrated into the meditation session:

1. **Auto-starts**: Generates when meditation session begins
2. **Looping**: 60-second track loops continuously
3. **Volume control**: Slider adjusts music volume (max 50% to keep it as background)
4. **Play/Pause**: Controls both voice agent and music together
5. **Stop**: Properly cleans up audio resources

## 🎯 How It Works

### When Session Starts

```typescript
1. User completes mood profiling
2. Meditation page loads
3. Two things happen simultaneously:
   - ElevenLabs voice agent connects
   - Music generation API call starts
4. Loading indicator shows "Generating soundscape..."
5. Music starts playing automatically when ready
6. Music loops in background while agent speaks
```

### Music Generation Process

```
User Mood → AI Analysis → Mood-Specific Prompt →
ElevenLabs Music API → 60s Instrumental Track →
Auto-loop Playback → Synchronized Controls
```

### Audio Mixing

- **Voice Agent**: 100% volume (adjustable)
- **Background Music**: 30% volume by default (max 50%)
- **Volume Slider**: Controls music volume (0-50% range)
- Both audio streams play simultaneously and mix naturally

## 🎨 Customization

### Change Music Prompts

Edit `lib/elevenlabsMusic.ts` line 18-28:

```typescript
const moodPrompts: Record<string, string> = {
  "stress-relief": "Your custom prompt here",
  "anxiety-reduction": "Another custom prompt",
  // Add more moods
};
```

### Adjust Music Length

Edit line 64 in `lib/elevenlabsMusic.ts`:

```typescript
music_length_ms: 60000, // Change to 30000 (30s), 120000 (2min), etc.
```

Note: API limits are 3000ms (3s) minimum, 300000ms (5min) maximum.

### Change Background Volume

Edit line 93 in `lib/elevenlabsMusic.ts`:

```typescript
this.audioElement.volume = 0.3; // Change 0.3 to 0.2 (quieter) or 0.5 (louder)
```

### Music Volume Range

Edit line 140 in `lib/elevenlabsMusic.ts`:

```typescript
this.audioElement.volume = Math.min(volume * 0.5, 0.5);
// Change the 0.5 multiplier and max to adjust range
```

## 🧪 Testing

### Test Music Generation

1. **Complete mood profiling**
2. **Go to meditation session**
3. **Look for**: "Generating soundscape..." indicator at top
4. **Listen**: Background ambient music should start within 5-10 seconds
5. **Check console**: Should see "🎵 Generating meditation music: [mood]"
6. **Check console**: Should see "✅ Meditation music playing"

### Test Controls

1. **Volume Slider**: Adjusts music volume (0-50% range)
2. **Play/Pause**: Pauses both voice and music
3. **Stop**: Ends session and stops all audio

### Troubleshooting

**"Background music generation failed"**

- Check if your ElevenLabs subscription includes Music Generation API
- Verify API key has access to music features
- Check browser console for specific error

**No music playing (no error)**

- Music generation can take 5-15 seconds
- Wait for loading indicator to disappear
- Check browser console for warnings

**Music too loud/quiet**

- Adjust the volume slider
- Or edit the default volume in the code

**Music doesn't loop**

- Check browser console for playback errors
- Try a different browser (Chrome recommended)

## 📊 Features

✅ **Mood-Aware**: Different music for each emotional state
✅ **AI-Generated**: Unique soundscape every time
✅ **Seamless Looping**: 60-second tracks loop smoothly
✅ **Volume Controlled**: Synchronized with UI controls
✅ **Non-Blocking**: Meditation continues even if music generation fails
✅ **Resource Cleanup**: Properly stops and cleans up on exit

## 🎼 Music API Details

Uses ElevenLabs Music Generation API ([documentation](https://elevenlabs.io/docs/api-reference/music/stream)):

```typescript
POST https://api.elevenlabs.io/v1/music/stream

Body:
{
  "prompt": "Calming ambient meditation music...",
  "music_length_ms": 60000,
  "model_id": "music_v1",
  "force_instrumental": true
}

Headers:
{
  "xi-api-key": "your-api-key",
  "Content-Type": "application/json"
}
```

## 💡 Best Practices

1. **Keep It Background**: Music should never overpower the voice agent
2. **Mood-Appropriate**: Match soundscape to emotional state
3. **Looping Quality**: 60 seconds is optimal for smooth loops
4. **Resource Management**: Always clean up audio on unmount

## 🚀 Future Enhancements

Potential improvements:

- [ ] User-selectable soundscape types (forest, ocean, rain, etc.)
- [ ] Crossfade between tracks for longer sessions
- [ ] Save favorite soundscapes to user profile
- [ ] Pre-generate music library for instant playback
- [ ] Adjust music tempo based on meditation phase
- [ ] Fade in/out at session start/end

## 📈 Performance

- **Generation Time**: 5-15 seconds (varies by API load)
- **File Size**: ~1-2MB for 60 seconds of MP3
- **Memory**: Minimal (single audio element)
- **CPU**: Low (native browser audio playback)

## 🔍 Console Output

When working correctly, you'll see:

```
🎵 Generating meditation music: stress-relief
Starting ElevenLabs session with variables: {...}
✅ Connected to ElevenLabs agent
✅ Using ElevenLabs built-in audio analyser
✅ Meditation music playing
```

## ✨ Result

You now have:

- 🎙️ **Voice Agent**: Personalized guided meditation
- 🎵 **Ambient Music**: AI-generated mood-based soundscape
- 🔮 **Visual ORB**: Reactive to voice audio
- 🎛️ **Full Control**: Play, pause, volume for everything

**The complete immersive meditation experience!** 🧘‍♀️✨

---

**Quick Test**: Just restart your dev server and start a new meditation session. You should hear both the voice AND the background music!
