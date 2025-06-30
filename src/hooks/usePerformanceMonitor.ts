
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  errorCount: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(performance.now());
  const errorCount = useRef<number>(0);

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // Log performance metrics for components that take longer than 100ms to render
    if (renderTime > 100) {
      console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }

    // Track memory usage if available
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB

      if (memoryUsage > 50) { // Alert if using more than 50MB
        console.warn(`${componentName} memory usage: ${memoryUsage.toFixed(2)}MB`);
      }
    }

    // Reset render start time for next render
    renderStartTime.current = performance.now();
  });

  const logError = (error: Error) => {
    errorCount.current++;
    console.error(`${componentName} error #${errorCount.current}:`, error);
  };

  return { logError };
};
