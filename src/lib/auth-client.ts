import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : undefined,
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
