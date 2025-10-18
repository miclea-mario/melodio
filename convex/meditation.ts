import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// Generate mood question using OpenAI
export const generateMoodQuestion = action({
  args: {
    conversationHistory: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Build conversation context
    const conversationContext = args.conversationHistory
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");

    const systemPrompt = `You are a compassionate meditation guide helping understand a user's emotional state. 
Based on their previous answers, generate ONE insightful follow-up question to better understand their mood, stress level, or emotional needs.

Generate questions that:
- Are open-ended but answerable in 2-3 words or a short phrase
- Build on previous responses
- Help identify specific stressors or emotional states
- Are empathetic and non-judgmental

Also provide 3-5 multiple choice options for the user to select from.

${conversationContext ? `Previous conversation:\n${conversationContext}` : "This is the first question."}

Respond in JSON format:
{
  "question": "Your question here?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                args.conversationHistory.length === 0
                  ? "Generate the first question to understand the user's current emotional state."
                  : "Generate the next question based on their previous answers.",
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error) {
      console.error("Error generating mood question:", error);
      throw error;
    }
  },
});

// Analyze mood profile and generate summary
export const analyzeMoodProfile = action({
  args: {
    conversationHistory: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      throw new Error("OpenAI API key not configured");
    }

    const conversationContext = args.conversationHistory
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");

    const systemPrompt = `You are a compassionate meditation guide analyzing a user's emotional state.
Based on their answers, provide:
1. A concise mood summary (2-3 sentences)
2. Key emotional themes
3. Suggested meditation focus

Conversation:
${conversationContext}

Respond in JSON format:
{
  "summary": "Brief empathetic summary of their emotional state",
  "themes": ["theme1", "theme2", "theme3"],
  "meditationType": "One of: stress-relief, anxiety-reduction, sleep, focus, general-wellness"
}`;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Analyze this mood profile." },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from OpenAI");
      }

      return JSON.parse(content);
    } catch (error) {
      console.error("Error analyzing mood profile:", error);
      throw error;
    }
  },
});

// Create meditation session
export const createSession = mutation({
  args: {
    mood: v.string(),
    moodProfile: v.object({
      questions: v.array(
        v.object({
          question: v.string(),
          answer: v.string(),
        })
      ),
      summary: v.string(),
    }),
    duration: v.number(),
    meditationType: v.optional(v.string()),
    preSessionRating: v.optional(v.number()),
    postSessionRating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("sessions", {
      userId,
      mood: args.mood,
      moodProfile: args.moodProfile,
      duration: args.duration,
      timestamp: Date.now(),
      meditationType: args.meditationType,
      preSessionRating: args.preSessionRating,
      postSessionRating: args.postSessionRating,
    });
  },
});

// Get user sessions
export const getUserSessions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 20);

    return sessions;
  },
});

// Get session statistics
export const getSessionStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
      };
    }

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSessions: sessions.length,
      totalDuration,
      averageDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
    };
  },
});

