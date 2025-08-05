
import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UseInactivityTrackerProps {
  timeoutMinutes?: number;
  onInactive?: () => void;
}

export const useInactivityTracker = ({ 
  timeoutMinutes = 2, 
  onInactive 
}: UseInactivityTrackerProps = {}) => {
  const { signOut } = useAuth();
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const lastActivityRef = React.useRef<number>(Date.now());

  const handleInactivity = React.useCallback(() => {
    // User inactive - logging out
    if (onInactive) {
      onInactive();
    } else {
      signOut();
    }
  }, [onInactive, signOut]);

  const resetTimer = React.useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      handleInactivity();
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, handleInactivity]);

  const handleActivity = React.useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  React.useEffect(() => {
    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'visibilitychange'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleActivity, resetTimer]);

  return {
    resetTimer,
    lastActivity: lastActivityRef.current
  };
};
