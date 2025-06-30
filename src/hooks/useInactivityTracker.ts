
import { useEffect, useRef, useCallback } from 'react';
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
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const handleInactivity = useCallback(() => {
    console.log('🔒 User inactive for 2 minutes, logging out...');
    if (onInactive) {
      onInactive();
    } else {
      signOut();
    }
  }, [onInactive, signOut]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      handleInactivity();
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, handleInactivity]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
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
