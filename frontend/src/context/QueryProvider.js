"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays "fresh" for 5 minutes — no refetch during this window
            staleTime: 5 * 60 * 1000,
            // Unused cache is garbage-collected after 15 minutes
            gcTime: 15 * 60 * 1000,
            // Only refetch on window focus if data is already stale
            refetchOnWindowFocus: "stale",
            // Only refetch on mount if data is already stale (prevents re-fetch on navigation)
            refetchOnMount: "stale",
            // Don't retry failed requests aggressively
            retry: 1,
          },
        },
      })

  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
