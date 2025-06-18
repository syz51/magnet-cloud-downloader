"use server";

import { env } from "@/env";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// Types for the server action
export interface Drive115Credentials {
  uid: string;
  cid: string;
  seid: string;
  kid: string;
}

export interface OfflineDownloadRequest {
  credentials: Drive115Credentials;
  urls: string[];
  save_dir_id?: string;
}

export interface OfflineDownloadResponse {
  message: string;
  hashes: string[];
  count: number;
}

export interface MagnetDownloadResult {
  success: boolean;
  data?: OfflineDownloadResponse;
  error?: string;
}

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Server action to download magnet links using 115driver
 * @param credentialId - The ID of the 115 credentials to use
 * @param urls - Array of magnet URLs to download
 * @param saveDirId - Optional directory ID to save files to
 * @param userId - User ID for authentication
 * @returns Promise with download result
 */
export async function downloadMagnetLinks(
  credentialId: string,
  urls: string[],
  saveDirId?: string,
  userId?: string,
): Promise<MagnetDownloadResult> {
  try {
    // Validate inputs
    if (!credentialId) {
      return { success: false, error: "Credential ID is required" };
    }

    if (!urls || urls.length === 0) {
      return { success: false, error: "At least one URL is required" };
    }

    if (urls.length > 50) {
      return { success: false, error: "Maximum 50 URLs allowed" };
    }

    // Validate magnet URLs
    const invalidUrls = urls.filter((url) => !url.startsWith("magnet:"));
    if (invalidUrls.length > 0) {
      return {
        success: false,
        error: 'All URLs must be valid magnet links starting with "magnet:"',
      };
    }

    // Get credentials from Convex
    const credential = await convex.query(
      api.drive115_credentials.getCredential,
      {
        id: credentialId as Id<"drive115_credentials">,
      },
    );

    if (!credential) {
      return { success: false, error: "Credentials not found" };
    }

    // Optional: Verify user ownership of credentials
    if (userId && credential.userId !== userId) {
      return { success: false, error: "Unauthorized access to credentials" };
    }

    // Prepare download request
    const downloadRequest: OfflineDownloadRequest = {
      credentials: {
        uid: credential.uid,
        cid: credential.cid,
        seid: credential.seid,
        kid: credential.kid,
      },
      urls: urls.filter((url) => url.trim() !== ""),
      save_dir_id: saveDirId ?? undefined,
    };

    // Make request to Go server
    const response = await fetch(
      `${env.NEXT_PUBLIC_GO_SERVER_URL}/api/v1/115/tasks/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(downloadRequest),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Download failed: ${response.status} ${errorText}`,
      };
    }

    const data = (await response.json()) as OfflineDownloadResponse;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Magnet download error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Simplified server action for form submissions
 * @param prevState - Previous form state (for useActionState)
 * @param formData - Form data containing the download parameters
 * @returns Promise with download result
 */
export async function downloadMagnetLinksFromForm(
  prevState: MagnetDownloadResult | null,
  formData: FormData,
): Promise<MagnetDownloadResult> {
  const credentialId = formData.get("credentialId") as string;
  const saveDirId = (formData.get("saveDirId") as string) || undefined;
  const userId = (formData.get("userId") as string) || undefined;

  // Parse URLs from form data (assuming they're sent as a JSON string or multiple fields)
  const urlsString = formData.get("urls") as string;
  let urls: string[] = [];

  try {
    urls = JSON.parse(urlsString || "[]") as string[];
  } catch {
    // Fallback: try to get individual URL fields
    urls = [];
    let i = 0;
    while (formData.get(`url_${i}`)) {
      const url = formData.get(`url_${i}`) as string;
      if (url.trim()) {
        urls.push(url.trim());
      }
      i++;
    }
  }

  return downloadMagnetLinks(credentialId, urls, saveDirId, userId);
}

/**
 * Get user's 115 credentials for server-side operations
 * @param userId - User ID
 * @returns Promise with user credentials
 */
export async function getUserCredentials(userId: string) {
  try {
    const credentials = await convex.query(
      api.drive115_credentials.getUserCredentials,
      {
        userId,
      },
    );
    return credentials;
  } catch (error) {
    console.error("Error fetching user credentials:", error);
    return [];
  }
}
