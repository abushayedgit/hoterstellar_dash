import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../api/client/normalizeError';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (error.status === 401 || error.status === 403) return false;
          if (error.status === 429) return false;
          if (error.status === 400 || error.status === 404 || error.status === 409) return false;
          if (error.status >= 500) return failureCount < 2;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
