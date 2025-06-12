"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut, useSession } from "@/lib/auth-client";
import {
  Calendar,
  Download,
  Loader2,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {session.user.name || "User"}!
              </h1>
              <p className="text-muted-foreground">
                Manage your account and access your content
              </p>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="w-fit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Account Status
                </CardTitle>
                <User className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <Badge
                  variant={session.user.emailVerified ? "default" : "secondary"}
                  className="mt-1"
                >
                  {session.user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  115 Accounts
                </CardTitle>
                <Download className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-muted-foreground text-xs">Accounts linked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Storage Used
                </CardTitle>
                <Download className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 GB</div>
                <p className="text-muted-foreground text-xs">of unlimited</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security</CardTitle>
                <Shield className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Secure</div>
                <p className="text-muted-foreground text-xs">Magic link auth</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Manage your accounts and start downloading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Link href="/dashboard/115-accounts">
                    <Button>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage 115 Accounts
                    </Button>
                  </Link>
                  <Button variant="outline" disabled>
                    <Download className="mr-2 h-4 w-4" />
                    Start Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  User Information
                </CardTitle>
                <CardDescription>
                  Your account details and personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-muted-foreground text-sm">
                      {session.user.name || "Not provided"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-muted-foreground text-sm">
                      {session.user.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User ID:</span>
                    <span className="text-muted-foreground font-mono text-sm">
                      {session.user.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Email Verified:</span>
                    <Badge
                      variant={
                        session.user.emailVerified ? "default" : "secondary"
                      }
                    >
                      {session.user.emailVerified ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Session Information
                </CardTitle>
                <CardDescription>
                  Details about your current session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Session ID:</span>
                    <span className="text-muted-foreground font-mono text-sm">
                      {session.session.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Expires At:</span>
                    <span className="text-muted-foreground text-sm">
                      {new Date(session.session.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Created At:</span>
                    <span className="text-muted-foreground text-sm">
                      {new Date(session.session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and settings for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col space-y-2 p-6"
                >
                  <Settings className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Profile Settings</div>
                    <div className="text-muted-foreground text-xs">
                      Update your profile information
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col space-y-2 p-6"
                >
                  <Download className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Download Manager</div>
                    <div className="text-muted-foreground text-xs">
                      Access magnet cloud downloader
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col space-y-2 p-6 sm:col-span-2 lg:col-span-1"
                >
                  <Shield className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Account Security</div>
                    <div className="text-muted-foreground text-xs">
                      Manage your security settings
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
