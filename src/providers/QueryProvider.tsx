// filepath: src/providers/QueryProvider.tsx
/**
 * TanStack Query provider with NERV-appropriate configuration.
 * Client component — wraps the application in query context.
 */

"use client";

import { QueryClient, QueryClientProvider, type QueryFunctionContext } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Default query function — routes by query key so passive cache consumers can
 * subscribe to a key (e.g. ["asteroids"]) without each re-declaring a queryFn.
 * The headless AsteroidFeed still drives the actual polling.
 */
async function defaultQueryFn({ queryKey }: QueryFunctionContext) {
  if (queryKey[0] === "asteroids") {
    const res = await fetch("/api/asteroids?days=7");
    if (!res.ok) throw new Error(`API ERROR: ${res.status}`);
    return res.json();
  }
  throw new Error(`No query function defined for key: ${JSON.stringify(queryKey)}`);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Initialize QueryClient inside useState to prevent sharing across requests in SSR
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Fallback fetcher for cache-only consumers (keyed by queryKey)
            queryFn: defaultQueryFn,
            // Data is considered fresh for 14 minutes (just under the 15-minute refetch interval)
            staleTime: 14 * 60 * 1000,
            // Keep cached data for 1 hour even when no components are subscribed
            gcTime: 60 * 60 * 1000,
            // Retry failed requests up to 3 times with exponential backoff
            retry: 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * Math.pow(2, attemptIndex), 30_000),
            // Refetch when window regains focus (operator returns to terminal)
            refetchOnWindowFocus: true,
            // Refetch when connection is restored
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
