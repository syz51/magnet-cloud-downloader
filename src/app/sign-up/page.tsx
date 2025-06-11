"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { CheckCircle, Loader2, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // For magic link, we use signIn.magicLink which handles both sign-in and sign-up
      const result = await signIn.magicLink({
        email,
        name,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message ?? "Failed to send magic link");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(
        `An unexpected error occurred: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-b px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center text-sm">
              Click the link in your email to complete your account setup. The
              link will expire in 1 hour.
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setName("");
              }}
              className="w-full"
            >
              Use a different email address
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="from-background to-muted/20 flex min-h-screen items-center justify-center bg-gradient-to-b px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Start your journey with us or{" "}
            <Link
              href="/sign-in"
              className="text-primary font-medium hover:underline"
            >
              sign in to your existing account
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/15 border-destructive/20 text-destructive rounded-md border px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <div className="relative">
                <User className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account with magic link"
              )}
            </Button>

            <p className="text-muted-foreground text-center text-xs">
              We&apos;ll send you a secure link to create your account without a
              password.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
