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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { downloadMagnetLinks } from "@/lib/magnet-download-actions";
import { useQuery as useConvexQuery } from "convex/react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Download,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { api } from "../../../../convex/_generated/api.js";

interface DownloadTask {
  id: string;
  urls: string[];
  status: "pending" | "downloading" | "completed" | "failed";
  createdAt: Date;
  hashes?: string[];
  count?: number;
  message?: string;
}

export default function MagnetDownloadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [magnetUrls, setMagnetUrls] = useState<string[]>([""]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string>("");
  const [saveDirId, setSaveDirId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [downloadTasks, setDownloadTasks] = useState<DownloadTask[]>([]);

  // Check authentication
  useEffect(() => {
    if (session === null) {
      router.push("/sign-in");
    }
  }, [session, router]);

  // Fetch user's 115 credentials
  const credentials = useConvexQuery(
    api.drive115_credentials.getUserCredentials,
    session?.user?.id ? { userId: session.user.id } : "skip",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCredentialId) {
      alert("Please select a 115 account");
      return;
    }

    const validUrls = magnetUrls.filter((url) => url.trim() !== "");
    if (validUrls.length === 0) {
      alert("Please enter at least one magnet URL");
      return;
    }

    if (validUrls.length > 50) {
      alert("Maximum 50 URLs allowed");
      return;
    }

    // Validate magnet URLs
    const invalidUrls = validUrls.filter((url) => !url.startsWith("magnet:"));
    if (invalidUrls.length > 0) {
      alert("All URLs must be valid magnet links starting with 'magnet:'");
      return;
    }

    // Add pending task immediately for UI feedback
    const pendingTask: DownloadTask = {
      id: Date.now().toString(),
      urls: validUrls,
      status: "pending",
      createdAt: new Date(),
    };
    setDownloadTasks((prev) => [pendingTask, ...prev]);

    // Use server action with transition
    startTransition(async () => {
      try {
        const result = await downloadMagnetLinks(
          selectedCredentialId,
          validUrls,
          saveDirId || undefined,
          session?.user?.id,
        );

        // Update the task with the result
        setDownloadTasks((prev) =>
          prev.map((task) =>
            task.id === pendingTask.id
              ? {
                  ...task,
                  status: result.success ? "completed" : "failed",
                  hashes: result.data?.hashes,
                  count: result.data?.count,
                  message: result.success ? result.data?.message : result.error,
                }
              : task,
          ),
        );

        if (result.success) {
          // Reset form on success
          setMagnetUrls([""]);
          setSaveDirId("");
          setSelectedCredentialId("");
          setIsDialogOpen(false);
        } else {
          alert(`Download failed: ${result.error}`);
        }
      } catch (error) {
        // Update task to failed state
        setDownloadTasks((prev) =>
          prev.map((task) =>
            task.id === pendingTask.id
              ? {
                  ...task,
                  status: "failed",
                  message:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : task,
          ),
        );
        alert(
          `Download failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    });
  };

  const removeDownloadTask = (taskId: string) => {
    setDownloadTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const addMagnetUrl = () => {
    if (magnetUrls.length < 50) {
      setMagnetUrls([...magnetUrls, ""]);
    }
  };

  const removeMagnetUrl = (index: number) => {
    if (magnetUrls.length > 1) {
      const newUrls = magnetUrls.filter((_, i) => i !== index);
      setMagnetUrls(newUrls);
    }
  };

  const updateMagnetUrl = (index: number, value: string) => {
    const newUrls = [...magnetUrls];
    newUrls[index] = value;
    setMagnetUrls(newUrls);
  };

  const getStatusBadge = (status: DownloadTask["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "downloading":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">Downloading</Badge>
        );
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (session === null) {
    return null;
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                Magnet Download
              </h1>
              <p className="text-muted-foreground">
                Download magnet links to your 115 cloud storage
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              disabled={!credentials || credentials.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Download
            </Button>
          </div>

          {/* Status Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Available Accounts
                </CardTitle>
                <Download className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {credentials?.length ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  115 accounts linked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Downloads
                </CardTitle>
                <Check className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    downloadTasks.filter((task) => task.status === "completed")
                      .length
                  }
                </div>
                <p className="text-muted-foreground text-xs">
                  Successful downloads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Files
                </CardTitle>
                <Download className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {downloadTasks
                    .filter((task) => task.status === "completed")
                    .reduce((acc, task) => acc + (task.count ?? 0), 0)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Files downloaded
                </p>
              </CardContent>
            </Card>
          </div>

          {/* No accounts warning */}
          {credentials && credentials.length === 0 && (
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  No 115 Accounts Linked
                </CardTitle>
                <CardDescription className="text-orange-700">
                  You need to link at least one 115 account before you can
                  download magnet links.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/dashboard/115-accounts">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Link 115 Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Download History */}
          <Card>
            <CardHeader>
              <CardTitle>Download History</CardTitle>
              <CardDescription>
                Recent magnet download tasks and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {downloadTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No downloads yet. Start by clicking &quot;New Download&quot;
                  above.
                </div>
              ) : (
                <div className="space-y-4">
                  {downloadTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(task.status)}
                          <span className="text-sm text-muted-foreground">
                            {task.createdAt.toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDownloadTask(task.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>URLs ({task.urls.length}):</strong>
                        </div>
                        <div className="max-h-20 overflow-y-auto">
                          {task.urls.map((url, index) => (
                            <div
                              key={index}
                              className="text-xs text-muted-foreground font-mono truncate"
                            >
                              {url}
                            </div>
                          ))}
                        </div>

                        {task.message && (
                          <div className="text-sm">
                            <strong>Message:</strong>{" "}
                            <span className="break-words overflow-wrap-anywhere">
                              {task.message}
                            </span>
                          </div>
                        )}

                        {task.count !== undefined && (
                          <div className="text-sm">
                            <strong>Files:</strong> {task.count}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Download Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Magnet Download</DialogTitle>
            <DialogDescription>
              Add magnet links to download to your 115 cloud storage.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="account">115 Account</Label>
              <select
                id="account"
                value={selectedCredentialId}
                onChange={(e) => setSelectedCredentialId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select an account...</option>
                {credentials?.map((cred) => (
                  <option key={cred._id} value={cred._id}>
                    {cred.name} ({cred.uid})
                  </option>
                ))}
              </select>
            </div>

            {/* Save Directory (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="saveDir">Save Directory ID (Optional)</Label>
              <Input
                id="saveDir"
                placeholder="Leave empty for default directory"
                value={saveDirId}
                onChange={(e) => setSaveDirId(e.target.value)}
              />
            </div>

            {/* Magnet URLs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Magnet URLs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMagnetUrl}
                  disabled={magnetUrls.length >= 50}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add URL
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {magnetUrls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder="magnet:?xt=urn:btih:..."
                      value={url}
                      onChange={(e) => updateMagnetUrl(index, e.target.value)}
                      required={index === 0 || url.trim() !== ""}
                    />
                    {magnetUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMagnetUrl(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Maximum 50 URLs. Only magnet links starting with
                &quot;magnet:&quot; are accepted.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Start Download
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
