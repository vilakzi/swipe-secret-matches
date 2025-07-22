
import { QueryClient } from "@tanstack/react-query";

// Create optimized query client with performance settings
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1, // Reduced retries for performance
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnMount: false, // Prevent unnecessary refetches
    },
  },
});

// Export both the factory function and instance
export { createQueryClient };
export const queryClient = createQueryClient();
