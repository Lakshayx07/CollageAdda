import { QueryClient } from '@tanstack/react-query';
import { get, set, del } from 'idb-keyval';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds default stale time
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours cache time
      refetchOnWindowFocus: true,
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
