"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, createIDBPersister } from "../utils/queryClient";

export default function QueryProvider({ children }) {
  // Use a constant valid key for IndexedDB
  // v2: drop poisoned chat-rooms caches that stored UI-formatted room lists
  const persister = createIDBPersister("campusAdda_reactQueryCache_v2");

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
