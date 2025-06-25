
import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface RetryableOperationOptions {
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  errorType?: 'auth' | 'upload' | 'network' | 'generic';
}

export const useRetryableOperation = (options: RetryableOperationOptions = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    errorType = 'generic'
  } = options;

  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  const { handleError } = useErrorHandler();

  const execute = useCallback(async (operation: () => Promise<any>) => {
    setLoading(true);
    setLastError(null);
    
    let currentRetry = 0;
    
    while (currentRetry <= maxRetries) {
      try {
        const result = await operation();
        setRetryCount(0);
        setLoading(false);
        onSuccess?.(result);
        return result;
      } catch (error: any) {
        console.error(`Operation failed (attempt ${currentRetry + 1}):`, error);
        setLastError(error);
        setRetryCount(currentRetry + 1);
        
        if (currentRetry === maxRetries) {
          setLoading(false);
          handleError(error, errorType);
          onError?.(error);
          throw error;
        }
        
        // Wait before retrying, with exponential backoff
        const delay = retryDelay * Math.pow(2, currentRetry);
        await new Promise(resolve => setTimeout(resolve, delay));
        currentRetry++;
      }
    }
  }, [maxRetries, retryDelay, onSuccess, onError, errorType, handleError]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setLastError(null);
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    retryCount,
    lastError,
    reset,
    hasMaxRetries: retryCount >= maxRetries
  };
};
