import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

