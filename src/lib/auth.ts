import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";

import { db } from "@/server/db";
import { env } from "@/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // TODO: Implement your email sending logic here
        // For now, you can log the magic link URL to the console
        console.log(`Magic link for ${email}: ${url}`);

        // Replace this with your actual email sending implementation
        // Example:
        // await sendEmail({
        //   to: email,
        //   subject: "Sign in to your account",
        //   html: `<p>Click <a href="${url}">here</a> to sign in to your account.</p>`
        // });
      },
    }),
    nextCookies(), // This should be the last plugin in the array
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
