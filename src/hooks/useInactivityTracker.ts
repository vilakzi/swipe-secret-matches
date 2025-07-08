
import { useEffect, useCallback } from 'react';

interface UseInactivityTrackerProps {
  timeoutMinutes: number;
  onInactive: () => void;
}

export const useInactivityTracker = ({ timeoutMinutes, onInactive }: UseInactivityTrackerProps) => {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  let inactivityTimer: NodeJS.Timeout;

  const resetTimer = useCallback(() => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(onInactive, timeoutMs);
  }, [onInactive, timeoutMs]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Start the timer
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [resetTimer]);
};
