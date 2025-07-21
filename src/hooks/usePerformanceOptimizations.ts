
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const usePerformanceOptimizations = () => {
  const queryClient = useQueryClient();

  // Preload critical resources
  const preloadResources = useCallback(() => {
    const criticalImages = [
      '/placeholder.svg',
      // Add more critical images here
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }, []);

  // Memory cleanup
  const performMemoryCleanup = useCallback(() => {
    // Clear old query cache entries
    queryClient.getQueryCache().clear();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }, [queryClient]);

  // Network status optimization
  const optimizeForNetworkStatus = useCallback(() => {
    const connection = (navigator as any).connection;
    if (!connection) return;

    const { effectiveType, downlink } = connection;
    
    // Adjust cache time based on connection speed
    if (effectiveType === '2g' || downlink < 1) {
      // Longer cache for slow connections
      queryClient.setDefaultOptions({
        queries: {
          staleTime: 600000, // 10 minutes
          gcTime: 1200000, // 20 minutes
        },
      });
    } else if (effectiveType === '4g' || downlink > 10) {
      // Shorter cache for fast connections
      queryClient.setDefaultOptions({
        queries: {
          staleTime: 60000, // 1 minute
          gcTime: 300000, // 5 minutes
        },
      });
    }
  }, [queryClient]);

  useEffect(() => {
    preloadResources();
    optimizeForNetworkStatus();

    // Cleanup on memory pressure
    const handleMemoryPressure = () => {
      performMemoryCleanup();
    };

    // Listen for memory pressure events (if supported)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        if (memInfo && memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.8) {
          handleMemoryPressure();
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [preloadResources, optimizeForNetworkStatus, performMemoryCleanup]);

  return {
    preloadResources,
    performMemoryCleanup,
    optimizeForNetworkStatus
  };
};
