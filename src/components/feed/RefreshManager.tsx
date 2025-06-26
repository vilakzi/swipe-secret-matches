
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, X } from 'lucide-react';

interface RefreshManagerProps {
  onRefresh: () => void;
  autoRefreshInterval?: number;
  className?: string;
}

const RefreshManager: React.FC<RefreshManagerProps> = ({
  onRefresh,
  autoRefreshInterval = 300000, // 5 minutes default
  className = ''
}) => {
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(autoRefreshInterval);
  const [isUserViewing, setIsUserViewing] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    const startCountdown = () => {
      setTimeUntilRefresh(autoRefreshInterval);
      
      countdownInterval = setInterval(() => {
        setTimeUntilRefresh(prev => {
          if (prev <= 1000) {
            setShowRefreshPrompt(true);
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    };

    // Start the initial countdown
    startCountdown();

    // Check for user activity
    const handleUserActivity = () => {
      setIsUserViewing(true);
    };

    // Detect if user is actively viewing (scroll, click, touch)
    const events = ['scroll', 'click', 'touchstart', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (interval) clearInterval(interval);
      if (countdownInterval) clearInterval(countdownInterval);
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [autoRefreshInterval]);

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

  if (!showRefreshPrompt) {
    return (
      <div className={`fixed bottom-20 right-4 text-xs text-gray-500 ${className}`}>
        Next refresh: {formatTime(timeUntilRefresh)}
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
