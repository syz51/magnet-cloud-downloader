import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all posts
export const getAllPosts = query({
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

// Query to get posts with pagination
export const getPostsPaginated = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db.query("posts").order("desc").take(limit);
  },
});

// Mutation to create a new post
export const createPost = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("posts", {
      name: args.name,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation to update a post
export const updatePost = mutation({
  args: {
    id: v.id("posts"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete a post
export const deletePost = mutation({
  args: {
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Query to get a single post by ID
export const getPost = query({
  args: {
    id: v.id("posts"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
