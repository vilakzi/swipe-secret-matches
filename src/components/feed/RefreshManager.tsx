
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, X } from 'lucide-react';
import { useUserActivity } from '@/hooks/useUserActivity';

interface RefreshManagerProps {
  onRefresh: () => void;
  autoRefreshInterval?: number;
  className?: string;
  respectUserActivity?: boolean;
}

const RefreshManager: React.FC<RefreshManagerProps> = ({
  onRefresh,
  autoRefreshInterval = 600000, // 10 minutes default (increased from 5 minutes)
  className = '',
  respectUserActivity = true
}) => {
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(autoRefreshInterval);
  const { shouldAllowAutoRefresh, isUserActive, isScrolling, isViewingVideo } = useUserActivity();

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    const startCountdown = () => {
      setTimeUntilRefresh(autoRefreshInterval);
      
      countdownInterval = setInterval(() => {
        setTimeUntilRefresh(prev => {
          if (prev <= 1000) {
            // Only show prompt if we should respect user activity and they're not active
            // OR if we don't respect user activity at all
            if (!respectUserActivity || shouldAllowAutoRefresh) {
              setShowRefreshPrompt(true);
            } else {
              // Reset countdown if user is active and we respect their activity
              console.log('🔄 Auto-refresh delayed - user is active');
              return autoRefreshInterval;
            }
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    };

    startCountdown();

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [autoRefreshInterval, respectUserActivity, shouldAllowAutoRefresh]);

  const handleRefreshNow = () => {
    setShowRefreshPrompt(false);
    onRefresh();
    setTimeUntilRefresh(autoRefreshInterval);
  };

  const handleDismiss = () => {
    setShowRefreshPrompt(false);
    // Reset countdown for another cycle
    setTimeUntilRefresh(autoRefreshInterval);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Show activity status in development
  const showActivityStatus = process.env.NODE_ENV === 'development';

  if (!showRefreshPrompt) {
    return (
      <div className={`fixed bottom-20 right-4 text-xs text-gray-500 ${className}`}>
        <div>Next refresh: {formatTime(timeUntilRefresh)}</div>
        {showActivityStatus && (
          <div className="text-xs mt-1">
            Active: {isUserActive ? '✓' : '✗'} | 
            Scrolling: {isScrolling ? '✓' : '✗'} | 
            Video: {isViewingVideo ? '✓' : '✗'}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium">Fresh content available</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-gray-300 text-sm mb-4">
          New posts are ready to load. Refresh now or continue viewing?
        </p>
        <div className="flex space-x-2">
          <Button
            onClick={handleRefreshNow}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Refresh Now
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Keep Viewing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RefreshManager;
