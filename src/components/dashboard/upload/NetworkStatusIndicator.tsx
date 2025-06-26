
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "You're back online!",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection lost", 
        description: "Upload unavailable until connection is restored",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
      <div className="flex items-center space-x-2">
        <WifiOff className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm font-medium">
          No internet - uploads unavailable
        </span>
      </div>
    </div>
  );
};

export default NetworkStatusIndicator;
