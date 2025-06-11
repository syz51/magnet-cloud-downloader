import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : undefined,
  plugins: [magicLinkClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
