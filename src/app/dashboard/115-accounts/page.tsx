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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/env";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useMutation as useConvexMutation,
  useQuery as useConvexQuery,
} from "convex/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Copy,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api.js";
import type { Id } from "../../../../convex/_generated/dataModel";

interface QRCodeSession {
  qrcodeContent: string;
  sign: string;
  time: number;
  uid: string;
}

interface QRCodeStatus {
  msg: string;
  status: number;
  version: string;
}

interface Credential {
  uid: string;
  cid: string;
  seid: string;
  kid: string;
}

interface QRCodeLoginResponse {
  credentials: Credential;
  success: boolean;
  message: string;
}

// Add skeleton components after the existing imports
const AccountSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center">
            <div className="h-5 w-5 mr-2 bg-muted rounded animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-6 w-12 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-8 bg-muted rounded animate-pulse" />
          <div className="flex items-center space-x-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-6 w-6 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Accounts115Page() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [qrSession, setQrSession] = useState<QRCodeSession | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  // Track if login has been attempted to prevent multiple calls
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Convex queries and mutations
  const credentials = useConvexQuery(
    api.drive115_credentials.getUserCredentials,
    session?.user?.id ? { userId: session.user.id } : "skip",
  );
  const createCredentials = useConvexMutation(
    api.drive115_credentials.createCredentials,
  );
  const deleteCredentials = useConvexMutation(
    api.drive115_credentials.deleteCredentials,
  );

  // Your Go server endpoints (update these to match your actual endpoints)
  const GO_SERVER_BASE = `${env.NEXT_PUBLIC_GO_SERVER_URL}/api/v1/115`;

  // React Query mutations and queries for QR code flow
  const startQRCodeMutation = useMutation({
    mutationFn: async () => {
      // Call your Go server to start QR code session
      const response = await fetch(`${GO_SERVER_BASE}/qrcode/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to start QR session: ${response.statusText}`);
      }

      return response.json() as Promise<QRCodeSession>;
    },
    onSuccess: async (qrData) => {
      setQrSession(qrData);

      // Generate QR code image
      try {
        const qrImageResponse = await fetch(`${GO_SERVER_BASE}/qrcode/image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uid: qrData.uid }),
        });

        if (qrImageResponse.ok) {
          const blob = await qrImageResponse.blob();
          const imageUrl = URL.createObjectURL(blob);
          setQrCodeImage(imageUrl);
        }
      } catch (err) {
        console.error("Failed to generate QR code image:", err);
      }
    },
  });

  // Query to poll QR code status
  const qrStatusQuery = useQuery({
    queryKey: ["qrStatus", qrSession?.uid],
    queryFn: async () => {
      if (!qrSession) return null;

      const response = await fetch(`${GO_SERVER_BASE}/qrcode/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: qrSession.uid,
          time: qrSession.time,
          sign: qrSession.sign,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check QR status: ${response.statusText}`);
      }

      return response.json() as Promise<QRCodeStatus>;
    },
    enabled: !!qrSession && !loginAttempted,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling if status is approved (2), expired (-1), or canceled (-2)
      if (
        data &&
        (data.status === 2 || data.status === -1 || data.status === -2)
      ) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    refetchIntervalInBackground: true,
  });

  // Mutation to complete login
  const completeLoginMutation = useMutation({
    mutationFn: async () => {
      if (!qrSession) {
        throw new Error("No QR session available");
      }

      const response = await fetch(`${GO_SERVER_BASE}/qrcode/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: qrSession.uid,
          sign: qrSession.sign,
          time: qrSession.time,
        }),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      return response.json() as Promise<QRCodeLoginResponse>;
    },
    onSuccess: async (loginResponse) => {
      // Check if the login was successful
      if (!loginResponse.success) {
        throw new Error(`Login failed: ${loginResponse.message}`);
      }

      // Save credentials to Convex
      if (!session?.user?.id) {
        throw new Error("User not logged in");
      }

      await createCredentials({
        userId: session.user.id,
        name: accountName || `115 Account ${Date.now()}`,
        uid: loginResponse.credentials.uid,
        cid: loginResponse.credentials.cid,
        seid: loginResponse.credentials.seid,
        kid: loginResponse.credentials.kid,
      });

      // Reset state and close dialog
      resetQRState();
      setIsDialogOpen(false);
      setAccountName("");
    },
  });

  const { isPending: loginIsPending, mutate: doLogin } = completeLoginMutation;

  useEffect(() => {
    if (qrStatusQuery.data && !loginAttempted && !loginIsPending) {
      if (qrStatusQuery.data.status === 2) {
        setLoginAttempted(true);
        doLogin();
      }
    }
  }, [qrStatusQuery.data, loginAttempted, loginIsPending, doLogin]);

  const resetQRState = () => {
    setQrSession(null);
    setQrCodeImage(null);
    setLoginAttempted(false);
    // Stop the status query by invalidating it
    queryClient.removeQueries({ queryKey: ["qrStatus"] });
  };

  const handleDeleteCredential = async (
    credentialId: Id<"drive115_credentials">,
  ) => {
    try {
      await deleteCredentials({ id: credentialId });
    } catch (err) {
      console.error("Failed to delete credential:", err);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  const getStatusIcon = (status?: number) => {
    switch (status) {
      case 0:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 2:
        return <Check className="h-4 w-4 text-green-500" />;
      case -1:
      case -2:
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <QrCode className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status?: number) => {
    switch (status) {
      case 0:
        return "Waiting for scan";
      case 1:
        return "QR code scanned";
      case 2:
        return "Login approved";
      case -1:
        return "QR code expired";
      case -2:
        return "Login canceled";
      default:
        return "Generating QR code...";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrCodeImage) {
        URL.revokeObjectURL(qrCodeImage);
      }
    };
  }, [qrCodeImage]);

  // Get current error state from mutations and queries
  const error =
    startQRCodeMutation.error ??
    qrStatusQuery.error ??
    completeLoginMutation.error ??
    null;
  const isLoading =
    startQRCodeMutation.isPending || completeLoginMutation.isPending;

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            {/* Back button */}
            <div className="mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Title and Add Account button */}
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  115 Accounts
                </h1>
                <p className="text-muted-foreground">
                  Manage your 115 cloud storage accounts
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetQRState()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add 115 Account</DialogTitle>
                    <DialogDescription>
                      Scan the QR code with your 115 mobile app to link your
                      account
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Account Name Input */}
                    {!qrSession && (
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          id="accountName"
                          placeholder="My 115 Account"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                        />
                      </div>
                    )}

                    {/* QR Code Display */}
                    {qrSession && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          {qrCodeImage ? (
                            <div className="space-y-4 text-center">
                              <Image
                                src={qrCodeImage}
                                alt="115 Login QR Code"
                                width={192}
                                height={192}
                                className="mx-auto rounded-lg border"
                              />
                              <div className="flex items-center justify-center space-x-2">
                                {getStatusIcon(qrStatusQuery.data?.status)}
                                <span className="text-sm text-muted-foreground">
                                  {getStatusText(qrStatusQuery.data?.status)}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed">
                              <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2 text-center text-sm text-muted-foreground">
                          <p>1. Open your 115 mobile app</p>
                          <p>2. Scan this QR code</p>
                          <p>3. Approve the login request</p>
                        </div>
                      </div>
                    )}

                    {/* Error Display */}
                    {error && (
                      <div className="flex items-center space-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                          {error instanceof Error
                            ? error.message
                            : "An error occurred"}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetQRState();
                          setIsDialogOpen(false);
                          setAccountName("");
                        }}
                      >
                        Cancel
                      </Button>
                      {!qrSession ? (
                        <Button
                          onClick={() => startQRCodeMutation.mutate()}
                          disabled={isLoading || !accountName.trim()}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <QrCode className="mr-2 h-4 w-4" />
                          )}
                          Generate QR Code
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => {
                            resetQRState();
                            startQRCodeMutation.mutate();
                          }}
                          disabled={isLoading}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-4">
            {credentials === undefined ? (
              // Skeleton loading state - matches the visual structure of real cards
              <>
                <AccountSkeleton />
                <AccountSkeleton />
                <AccountSkeleton />
              </>
            ) : credentials.length === 0 ? (
              // Empty state with reserved minimum height
              <Card className="min-h-[240px]">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <QrCode className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h2 className="mb-2 text-xl font-semibold">
                    No 115 Accounts
                  </h2>
                  <p className="mb-4 text-muted-foreground">
                    Add your first 115 account to start downloading
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              credentials.map((credential) => (
                <Card key={credential._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <QrCode className="mr-2 h-5 w-5" />
                          {credential.name}
                        </CardTitle>
                        <CardDescription>
                          Added{" "}
                          {new Date(credential.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Active</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCredential(credential._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">UID:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs">
                            {credential.uid.slice(0, 12)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(credential.uid)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Last Updated:
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(credential.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
