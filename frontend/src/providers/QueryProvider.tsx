import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults for all queries
      retry: 1, // Retry failed requests once
      retryDelay: 1000, // Wait 1 second before retry
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes - keep data in cache for 10 minutes (gcTime replaces cacheTime in v5)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnReconnect: true, // Refetch when internet reconnects
      refetchOnMount: true, // Refetch when component mounts
    },
    mutations: {
      // Global defaults for all mutations
      retry: 1, // Retry failed mutations once
      retryDelay: 1000, // Wait 1 second before retry
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

// Export the query client for manual invalidation if needed
export { queryClient };
