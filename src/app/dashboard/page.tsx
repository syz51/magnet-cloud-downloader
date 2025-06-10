"use client";

import { useSession, signOut } from "@/lib/auth-client";
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">
                  Welcome to your Dashboard
                </h1>
                <p className="text-white/70">
                  Manage your account and access your content
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-md border border-red-500/50 bg-red-500/20 px-4 py-2 text-red-200 transition-colors hover:bg-red-500/30"
              >
                Sign Out
              </button>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  User Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-white/60">Name:</span>
                    <p className="font-medium text-white">
                      {session.user.name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Email:</span>
                    <p className="font-medium text-white">
                      {session.user.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">User ID:</span>
                    <p className="font-mono text-sm font-medium text-white">
                      {session.user.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Email Verified:</span>
                    <p className="font-medium text-white">
                      {session.user.emailVerified ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                  Session Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-white/60">Session ID:</span>
                    <p className="font-mono text-sm font-medium text-white">
                      {session.session.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Expires At:</span>
                    <p className="font-medium text-white">
                      {new Date(session.session.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Created At:</span>
                    <p className="font-medium text-white">
                      {new Date(session.session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <button className="rounded-lg border border-[hsl(280,100%,70%)]/30 bg-[hsl(280,100%,70%)]/20 p-4 text-white transition-colors hover:bg-[hsl(280,100%,70%)]/30">
                  <div className="text-sm font-medium">Profile Settings</div>
                  <div className="mt-1 text-xs text-white/60">
                    Update your profile information
                  </div>
                </button>
                <button className="rounded-lg border border-blue-500/30 bg-blue-500/20 p-4 text-white transition-colors hover:bg-blue-500/30">
                  <div className="text-sm font-medium">Download Manager</div>
                  <div className="mt-1 text-xs text-white/60">
                    Access magnet cloud downloader
                  </div>
                </button>
                <button className="rounded-lg border border-green-500/30 bg-green-500/20 p-4 text-white transition-colors hover:bg-green-500/30">
                  <div className="text-sm font-medium">Account Security</div>
                  <div className="mt-1 text-xs text-white/60">
                    Manage your security settings
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
