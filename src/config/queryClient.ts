
import { QueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.status === 404 || error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 3 times with exponential backoff
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 2,
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "An unexpected error occurred",
        });
      },
    },
  },
  // Global error handler
  queryCache: {
    onError: (error: any) => {
      // Only show toast for network errors or unexpected errors
      if (!error?.status || error?.status >= 500) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Please check your connection and try again",
        });
      }
    },
  },
});
