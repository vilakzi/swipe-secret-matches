
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseUserActivityOptions {
  inactiveThreshold?: number; // milliseconds
  scrollThreshold?: number; // pixels
}

export const useUserActivity = (options: UseUserActivityOptions = {}) => {
  const { inactiveThreshold = 30000, scrollThreshold = 50 } = options; // 30 seconds default
  
  const [isUserActive, setIsUserActive] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isViewingVideo, setIsViewingVideo] = useState(false);
  
  const lastActivityRef = useRef(Date.now());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(window.scrollY);

  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsUserActive(true);
    
    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Set new timeout for inactivity
    activityTimeoutRef.current = setTimeout(() => {
      setIsUserActive(false);
    }, inactiveThreshold);
  }, [inactiveThreshold]);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);
    
    if (scrollDelta > scrollThreshold) {
      setIsScrolling(true);
      updateActivity();
      lastScrollY.current = currentScrollY;
      
      // Clear existing scroll timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set scrolling to false after user stops scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    }
  }, [scrollThreshold, updateActivity]);

  const handleUserInteraction = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  // Detect video viewing state
  const setVideoViewing = useCallback((viewing: boolean) => {
    setIsViewingVideo(viewing);
    if (viewing) {
      updateActivity();
    }
  }, [updateActivity]);

  useEffect(() => {
    // Activity detection events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      if (event === 'scroll') {
        window.addEventListener(event, handleScroll, { passive: true });
      } else {
        window.addEventListener(event, handleUserInteraction, { passive: true });
      }
    });

    // Initialize activity timeout
    updateActivity();

    return () => {
      events.forEach(event => {
        if (event === 'scroll') {
          window.removeEventListener(event, handleScroll);
        } else {
          window.removeEventListener(event, handleUserInteraction);
        }
      });
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [handleScroll, handleUserInteraction, updateActivity]);

  return {
    isUserActive,
    isScrolling,
    isViewingVideo,
    setVideoViewing,
    shouldAllowAutoRefresh: isUserActive && !isScrolling && !isViewingVideo
  };
};
