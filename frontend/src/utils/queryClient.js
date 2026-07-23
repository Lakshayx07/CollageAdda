import { QueryClient } from '@tanstack/react-query';
import { get, set, del } from 'idb-keyval';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes — serve cache first, refresh in background
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (v5; cacheTime was ignored)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

// Create an IndexedDB persister
export const createIDBPersister = (idbValidKey = 'reactQuery') => {
  return {
    persistClient: async (client) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  };
};
