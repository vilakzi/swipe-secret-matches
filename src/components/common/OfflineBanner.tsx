
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRetry(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setTimeout(() => setShowRetry(true), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-md mx-auto">
      <Alert className="bg-orange-900/90 border-orange-700 backdrop-blur-md">
        <WifiOff className="h-4 w-4 text-orange-400" />
        <AlertDescription className="text-orange-100 flex items-center justify-between">
          <span>You're offline. Some features may be limited.</span>
          {showRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="text-orange-200 hover:text-orange-100 p-1 h-auto ml-2"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OfflineBanner;
