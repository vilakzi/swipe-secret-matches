
import { useState, useEffect } from 'react';

export const useNetworkStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Network: Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Network: Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test actual connectivity periodically
    const testConnection = async () => {
      if (navigator.onLine) {
        try {
          await fetch('https://galrcqwogqqdsqdzfrrd.supabase.co/rest/v1/', {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          setIsOnline(true);
        } catch {
          setIsOnline(false);
        }
      }
    };

    const interval = setInterval(testConnection, 30000); // Test every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
};
