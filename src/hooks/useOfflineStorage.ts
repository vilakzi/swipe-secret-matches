
import { useState, useEffect, useCallback } from 'react';

interface OfflineStorageOptions {
  key: string;
  initialData?: any;
  syncOnOnline?: boolean;
}

export const useOfflineStorage = <T>({
  key,
  initialData = null,
  syncOnOnline = true
}: OfflineStorageOptions) => {
  const [data, setData] = useState<T>(initialData);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData(parsed.data);
        setLastSync(new Date(parsed.timestamp));
      }
    } catch (error) {
      console.warn('Failed to load offline data:', error);
    }
  }, [key]);

  // Save data to localStorage
  const saveOffline = useCallback((newData: T) => {
    try {
      const dataToStore = {
        data: newData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`offline_${key}`, JSON.stringify(dataToStore));
      setData(newData);
      setLastSync(new Date());
    } catch (error) {
      console.warn('Failed to save offline data:', error);
    }
  }, [key]);

  // Clear offline data
  const clearOffline = useCallback(() => {
    try {
      localStorage.removeItem(`offline_${key}`);
      setData(initialData);
      setLastSync(null);
    } catch (error) {
      console.warn('Failed to clear offline data:', error);
    }
  }, [key, initialData]);

  // Check if data is stale (older than 1 hour)
  const isStale = useCallback(() => {
    if (!lastSync) return true;
    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    return now.getTime() - lastSync.getTime() > oneHour;
  }, [lastSync]);

  return {
    data,
    isOnline,
    lastSync,
    saveOffline,
    clearOffline,
    isStale: isStale()
  };
};
