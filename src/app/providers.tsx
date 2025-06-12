"use client";

import { env } from "@/env";
import { getQueryClient } from "@/lib/get-query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const convex = new ConvexReactClient(env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <QueryClientProvider client={queryClient}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
