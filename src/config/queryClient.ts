
import { QueryClient } from "@tanstack/react-query";

// Create a function to create the query client to avoid any initialization issues
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
    },
  },
});

// Export the query client instance
export const queryClient = createQueryClient();
