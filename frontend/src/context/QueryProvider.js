"use client";

import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, createIDBPersister } from "../utils/queryClient";

export default function QueryProvider({ children }) {
  // Use a constant valid key for IndexedDB
  const persister = createIDBPersister("campusAdda_reactQueryCache");

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
