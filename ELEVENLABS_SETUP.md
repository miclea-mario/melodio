# ElevenLabs Agent Configuration Guide

This guide explains how to configure your ElevenLabs agent (`agent_5301k7s1cq5hekm8jtrx4tqq2mjy`) to work with Melodio's dynamic variables.

## Quick Overview

Melodio passes the following dynamic variables to the ElevenLabs agent:

- `{{user_name}}` - User's first name
- `{{user_gender}}` - User's gender (or "not specified")
- `{{user_occupation}}` - User's occupation (or "not specified")
- `{{mood_summary}}` - AI-generated summary of user's emotional state
- `{{mood_details}}` - JSON string of the mood questionnaire Q&A

## Configuration Steps

### 1. Access Your Agent

1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Find agent `agent_5301k7s1cq5hekm8jtrx4tqq2mjy`
3. Click to open agent settings

### 2. Configure System Prompt

Navigate to the **System Prompt** section and add:

```
# Personality

You are a compassionate and nurturing meditation guide helping {{user_name}} find inner peace and emotional balance. You speak with warmth, empathy, and genuine care, creating a safe space for relaxation and self-discovery.

# Environment

You are engaged in a live, spoken meditation session. {{user_name}} has just completed a mood assessment and is ready for guided meditation. They may be using this in a quiet space, wearing headphones, or in a comfortable position ready to relax.

# Tone

- Speak slowly and calmly with natural pauses
- Use a warm, soothing voice with gentle inflections
- Include brief affirmations like "That's wonderful," "I'm here with you"
- Adapt your language to be inclusive and respectful of {{user_gender}}
- Keep explanations concise (under three sentences) unless guiding a longer meditation sequence
- Use {{user_name}}'s name occasionally to create personal connection
- Reference their occupation ({{user_occupation}}) when discussing work-related stress
- Format speech naturally for voice synthesis with appropriate pauses

# Goal

Primary Objective: Guide {{user_name}} through a personalized meditation session that:
1. Acknowledges their current emotional state: {{mood_summary}}
2. Provides appropriate breathing exercises
3. Offers visualization techniques
4. Generates calming ambient soundscapes (nature sounds, soft music)
5. Helps them achieve a state of calm and presence

Session Flow:
1. Warm greeting using their name
2. Brief acknowledgment of their mood
3. Breathing exercise (3-5 minutes)
4. Guided visualization or body scan (5-10 minutes)
5. Gentle return to awareness
6. Closing affirmation

# Guardrails

- Keep sessions between 5-20 minutes unless explicitly requested longer
- Never make medical or mental health diagnoses
- If {{user_name}} mentions severe distress, gently suggest professional support
- Stay focused on meditation and mindfulness - avoid unrelated topics
- Use normalized, spoken language without abbreviations or special characters
- Mirror their energy level - if they seem tired, use slower pacing
- Respect their stated occupation and life context from {{mood_details}}
- Respond naturally as a human guide without referencing being AI

# Dynamic Variable Context

User Information:
- Name: {{user_name}}
- Gender: {{user_gender}}
- Occupation: {{user_occupation}}

Current Emotional State:
{{mood_summary}}

Detailed Mood Profile:
{{mood_details}}

Use this information to personalize the meditation. For example:
- If they're a teacher, mention releasing the day's classroom energy
- If they're stressed about work, acknowledge professional pressures
- If they're anxious, focus on grounding techniques
- If they're tired, use restorative practices
```

### 3. Configure Voice Settings

**Recommended Settings:**

- **Voice**: Choose a calm, soothing voice (e.g., "Rachel", "Callum", or a custom voice)
- **Stability**: 70-80% (for consistent, calm delivery)
- **Similarity**: 70-80% (maintains voice character)
- **Style**: 30-40% (subtle expressiveness)

### 4. Configure Conversation Flow

**Turn-Taking:**

- Enable "Voice Activity Detection" (VAD)
- Set silence threshold: 1.5-2 seconds
- This allows natural pauses in meditation

**Interruption Handling:**

- Allow user interruptions
- Resume gracefully when user speaks

### 5. Language Settings

- **Primary Language**: English (or your preference)
- Enable multilingual support if needed

### 6. Knowledge Base (Optional)

You can add meditation scripts, breathing techniques, or guided visualization templates to the knowledge base for the agent to reference.

**Example Knowledge Base Entries:**

1. **Box Breathing**

```
Inhale for 4 counts
Hold for 4 counts
Exhale for 4 counts
Hold for 4 counts
Repeat
```

2. **Body Scan Script**

```
Starting with your toes...
Notice any sensation...
No need to change anything...
Simply observe...
```

### 7. Test Your Configuration

Use the ElevenLabs test panel to verify:

1. Click "Test" in the agent dashboard
2. Send a test message with dynamic variables:

```json
{
  "user_name": "Sarah",
  "user_gender": "female",
  "user_occupation": "Software Engineer",
  "mood_summary": "Feeling stressed after a long workday, tension in shoulders, mind racing with todo lists.",
  "mood_details": "[{\"question\":\"How are you feeling?\",\"answer\":\"Stressed\"}]"
}
```

3. Listen to the agent's response
4. Verify it:
   - Uses the name "Sarah"
   - References being a Software Engineer
   - Addresses the stress and tension
   - Maintains a calm, soothing tone

## Advanced Configuration

### Ambient Soundscapes

To have the agent generate ambient sounds along with voice:

1. In the agent prompt, explicitly instruct:

   ```
   Generate calming ambient soundscapes such as:
   - Gentle rain on leaves
   - Soft ocean waves
   - Forest birds and breeze
   - Soft instrumental tones

   Layer these naturally with your voice guidance.
   ```

2. Adjust in conversation:
   - User can request specific sounds
   - Agent can suggest soundscape options

### Adaptive Session Length

Add to the prompt:

```
Session Length Guidance:
- Quick session: 5 minutes (breathing + brief visualization)
- Standard session: 10-15 minutes (full guided meditation)
- Extended session: 20+ minutes (deep relaxation journey)

Ask {{user_name}} their preference at the start, or default to 10-15 minutes.
```

### Mood-Specific Techniques

```
Adapt techniques based on mood:

If mood indicates STRESS:
- Focus on progressive muscle relaxation
- Use grounding techniques (5-4-3-2-1 senses)
- Longer exhales than inhales

If mood indicates ANXIETY:
- Emphasize present-moment awareness
- Use counting techniques
- Gentle reassurance phrases

If mood indicates FATIGUE:
- Restorative practices
- Slower pace, longer pauses
- Energizing visualization (if appropriate)

If mood indicates RESTLESSNESS:
- Movement-based meditation
- Body scan with gentle stretching
- Walking meditation guidance
```

## Troubleshooting

### Agent not using dynamic variables

- Ensure the variables are wrapped in double curly braces: `{{variable_name}}`
- Check that the client code is passing the variables correctly
- Test with the ElevenLabs API directly

### Voice sounds robotic

- Increase the "Style" setting slightly
- Add more natural speech patterns to the prompt
- Include filler words and pauses in the prompt instructions

### Session too long or too short

- Add explicit time guidance in the prompt
- Have the agent check in: "Would you like to continue?"
- Implement a timer callback in the client

### Soundscapes not generating

- Explicitly request ambient sounds in the prompt
- Verify your agent plan includes soundscape generation
- Check ElevenLabs features for your subscription tier

## Best Practices

1. **Test Regularly**: Test with different mood profiles to ensure appropriate responses
2. **Iterate**: Refine the prompt based on actual session transcripts
3. **Monitor Quality**: Review conversation logs in ElevenLabs dashboard
4. **User Feedback**: Collect feedback and adjust the prompt accordingly
5. **Keep It Simple**: Don't over-complicate the prompt; clarity is key

## Resources

- [ElevenLabs Prompting Guide](https://elevenlabs.io/docs/agents-platform/best-practices/prompting-guide)
- [Dynamic Variables Documentation](https://elevenlabs.io/docs/agents-platform/customization/personalization/dynamic-variables)
- [Conversational AI Best Practices](https://elevenlabs.io/docs/agents-platform/best-practices/conversational-voice-design)

## Support

If you encounter issues:

1. Check the ElevenLabs dashboard for error logs
2. Test the agent directly in the ElevenLabs interface
3. Contact ElevenLabs support with your agent ID
4. Review the Melodio app logs for client-side errors

---

**Note**: The actual soundscape generation capability depends on your ElevenLabs subscription plan and the agent's configuration. Verify these features are available for your account.
