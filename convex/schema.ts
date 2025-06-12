import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Drive115 credentials table to store user-specific 115driver credentials
  drive115_credentials: defineTable({
    userId: v.string(), // References user ID from Better Auth
    name: v.string(), // Friendly name for the credential set
    uid: v.string(),
    cid: v.string(),
    seid: v.string(),
    kid: v.string(),
    createdAt: v.number(), // Unix timestamp in milliseconds
    updatedAt: v.number(), // Unix timestamp in milliseconds
  })
    .index("by_user_id", ["userId"])
    .index("by_user_and_name", ["userId", "name"]) // Enforces unique constraint at application level
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"]),
});
