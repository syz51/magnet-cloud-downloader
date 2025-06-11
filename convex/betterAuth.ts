import {
  ConvexHandler,
  type ConvexReturnType,
} from "@better-auth-kit/convex/handler";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery } from "./_generated/server";

const { betterAuth, query, insert, update, delete_, count, getSession } =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ConvexHandler({
    action,
    internalQuery,
    internalMutation,
    internal,
  }) as ConvexReturnType;

export { betterAuth, query, insert, update, delete_, count, getSession };
