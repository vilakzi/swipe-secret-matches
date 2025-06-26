
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Smartphone, Signal } from 'lucide-react';

interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  isSlowConnection: boolean;
  effectiveType: string;
}

interface MobileNetworkDetectorProps {
  onNetworkChange: (networkInfo: NetworkInfo) => void;
}

const MobileNetworkDetector: React.FC<MobileNetworkDetectorProps> = ({ onNetworkChange }) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    isSlowConnection: false,
    effectiveType: 'unknown'
  });

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      const info: NetworkInfo = {
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        isSlowConnection: connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g',
        effectiveType: connection?.effectiveType || 'unknown'
      };

      setNetworkInfo(info);
      onNetworkChange(info);
    };

    const handleOnline = () => updateNetworkInfo();
    const handleOffline = () => updateNetworkInfo();
    const handleConnectionChange = () => updateNetworkInfo();

    // Initial check
    updateNetworkInfo();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [onNetworkChange]);

  if (!networkInfo.isOnline) {
    return (
      <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-medium">
            No connection - uploads disabled
          </span>
        </div>
      </div>
    );
  }

  if (networkInfo.isSlowConnection) {
    return (
      <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Signal className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">
            Slow connection detected - uploads may take longer
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 text-green-400 text-xs">
      <Wifi className="w-3 h-3" />
      <span>{networkInfo.effectiveType !== 'unknown' ? networkInfo.effectiveType.toUpperCase() : 'Online'}</span>
    </div>
  );
};

export default MobileNetworkDetector;
