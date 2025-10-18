import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  // User profile extension
  userProfiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    gender: v.optional(v.string()),
    occupation: v.optional(v.string()),
    profileCompleted: v.boolean(),
  }).index("by_user", ["userId"]),
  // Meditation sessions
  sessions: defineTable({
    userId: v.id("users"),
    mood: v.string(),
    moodProfile: v.object({
      questions: v.array(v.object({
        question: v.string(),
        answer: v.string(),
      })),
      summary: v.string(),
    }),
    duration: v.number(),
    timestamp: v.number(),
    meditationType: v.optional(v.string()),
    preSessionRating: v.optional(v.number()), // 1-10 rating before session
    postSessionRating: v.optional(v.number()), // 1-10 rating after session
  }).index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"]),
});
