import { QueryClient } from '@tanstack/query-core';
const queryClient = new QueryClient();
queryClient.mount();
const observer = new queryClient.constructor.__proto__.constructor.QueryObserver(queryClient, {
  queryKey: ['test'],
  queryFn: () => Promise.resolve('ok'),
  enabled: false
});
console.log(observer.getCurrentResult().isLoading);
