import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

// Query to get all credentials for a specific user
export const getUserCredentials = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("drive115_credentials")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Query to get a single credential by ID
export const getCredential = query({
  args: {
    id: v.id("drive115_credentials"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Mutation to create new 115driver credentials
export const createCredentials = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    uid: v.string(),
    cid: v.string(),
    seid: v.string(),
    kid: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if credentials with this name already exist for this user
    const existing = await ctx.db
      .query("drive115_credentials")
      .withIndex("by_user_and_name", (q) =>
        q.eq("userId", args.userId).eq("name", args.name),
      )
      .first();

    if (existing) {
      throw new ConvexError(
        "Credentials with this name already exist for this user",
      );
    }

    const now = Date.now();
    return await ctx.db.insert("drive115_credentials", {
      userId: args.userId,
      name: args.name,
      uid: args.uid,
      cid: args.cid,
      seid: args.seid,
      kid: args.kid,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation to update existing credentials
export const updateCredentials = mutation({
  args: {
    id: v.id("drive115_credentials"),
    name: v.optional(v.string()),
    uid: v.optional(v.string()),
    cid: v.optional(v.string()),
    seid: v.optional(v.string()),
    kid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Get the existing credential to check ownership
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new ConvexError("Credentials not found");
    }

    // If name is being updated, check for conflicts
    if (updates.name && updates.name !== existing.name) {
      const nameConflict = await ctx.db
        .query("drive115_credentials")
        .withIndex("by_user_and_name", (q) =>
          q.eq("userId", existing.userId).eq("name", updates.name!),
        )
        .first();

      if (nameConflict) {
        throw new ConvexError(
          "Credentials with this name already exist for this user",
        );
      }
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    );

    return await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to delete credentials
export const deleteCredentials = mutation({
  args: {
    id: v.id("drive115_credentials"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new ConvexError("Credentials not found");
    }

    return await ctx.db.delete(args.id);
  },
});

// Mutation to delete all credentials for a user
export const deleteAllUserCredentials = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const credentials = await ctx.db
      .query("drive115_credentials")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    const deletePromises = credentials.map((cred) => ctx.db.delete(cred._id));
    await Promise.all(deletePromises);

    return { deletedCount: credentials.length };
  },
});

// Query to get credentials count for a user
export const getUserCredentialsCount = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const credentials = await ctx.db
      .query("drive115_credentials")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();

    return credentials.length;
  },
});

// Query to get the most recently created credentials for a user
export const getLatestCredentials = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 1;
    return await ctx.db
      .query("drive115_credentials")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Action to validate 115driver credentials (this would typically make an external API call)
export const validateCredentials = action({
  args: {
    uid: v.string(),
    cid: v.string(),
    seid: v.string(),
    kid: v.string(),
  },
  handler: async (ctx, args) => {
    // This is a placeholder for actual 115driver validation
    // In a real implementation, you would make an HTTP request to 115 API
    // to validate these credentials

    try {
      // Example validation logic (replace with actual 115driver API call)
      if (!args.uid || !args.cid || !args.seid || !args.kid) {
        return { valid: false, error: "All credential fields are required" };
      }

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, we'll assume credentials are valid if they're not empty
      // In reality, you'd make an HTTP request like:
      // const response = await fetch('https://115.com/api/validate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ uid: args.uid, cid: args.cid, seid: args.seid, kid: args.kid })
      // });

      return { valid: true, message: "Credentials appear to be valid" };
    } catch (error) {
      return { valid: false, error: `Validation failed: ${String(error)}` };
    }
  },
});

// Mutation to create credentials from cookie string (utility function)
export const createCredentialsFromCookie = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    cookieString: v.string(),
  },
  handler: async (ctx, args) => {
    // Parse cookie string to extract credential values
    // This is a simplified parser - you might need to adjust based on actual cookie format
    const extractFromCookie = (cookieStr: string, key: string): string => {
      const regex = new RegExp(`${key}=([^;]+)`);
      const match = cookieStr.match(regex);
      return match ? (match[1] ?? "") : "";
    };

    const uid = extractFromCookie(args.cookieString, "UID");
    const cid = extractFromCookie(args.cookieString, "CID");
    const seid = extractFromCookie(args.cookieString, "SEID");
    const kid = extractFromCookie(args.cookieString, "KID");

    if (!uid || !cid || !seid || !kid) {
      throw new ConvexError(
        "Could not extract all required credentials from cookie string",
      );
    }

    // Check if credentials with this name already exist for this user
    const existing = await ctx.db
      .query("drive115_credentials")
      .withIndex("by_user_and_name", (q) =>
        q.eq("userId", args.userId).eq("name", args.name),
      )
      .first();

    if (existing) {
      throw new ConvexError(
        "Credentials with this name already exist for this user",
      );
    }

    const now = Date.now();
    return await ctx.db.insert("drive115_credentials", {
      userId: args.userId,
      name: args.name,
      uid,
      cid,
      seid,
      kid,
      createdAt: now,
      updatedAt: now,
    });
  },
});
