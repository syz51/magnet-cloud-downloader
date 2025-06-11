import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { convexAdapter } from "@better-auth-kit/convex";
import { ConvexHttpClient } from "convex/browser";

import { env } from "@/env";

const resend = new Resend();
const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

export const auth = betterAuth({
  database: convexAdapter(convex),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          const { data, error } = await resend.emails.send({
            from: "Magic Link <onboarding@resend.dev>", // Replace with your verified domain
            to: [email],
            subject: "Sign in to your account",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Sign in to your account</h2>
                <p>Click the button below to sign in to your account. This link will expire in 24 hours.</p>
                <a href="${url}" style="
                  display: inline-block;
                  background-color: #007bff;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                ">Sign In</a>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">${url}</p>
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 14px;">
                  If you didn't request this email, you can safely ignore it.
                </p>
              </div>
            `,
          });

          if (error) {
            console.error("Error sending magic link:", error);
            throw error;
          }

          console.log("Magic link sent successfully:", data);
        } catch (error) {
          console.error("Failed to send magic link:", error);
          throw error;
        }
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
