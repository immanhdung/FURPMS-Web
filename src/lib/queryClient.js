import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client with sensible defaults for FURPMS:
 * - staleTime: 2 minutes — avoids refetching on every mount while still being reasonably fresh
 * - gcTime: 10 minutes — keeps inactive data in cache for quick re-mount
 * - retry: 1 — single retry on failure (server errors may not be transient)
 * - refetchOnWindowFocus: true — refresh data when user returns to tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,      // 2 minutes
      gcTime: 10 * 60 * 1000,         // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});
