
import { useState, useCallback, useEffect } from 'react';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  blockedUntil?: number;
}

interface UseClientRateLimitOptions {
  maxAttempts?: number;
  windowMs?: number;
  blockDurationMs?: number;
}

export const useClientRateLimit = (options: UseClientRateLimitOptions = {}) => {
  const {
    maxAttempts = 3,
    windowMs = 15 * 60 * 1000, // 15 minutes
    blockDurationMs = 15 * 60 * 1000 // 15 minutes
  } = options;

  const [rateLimitStates, setRateLimitStates] = useState<Record<string, RateLimitState>>({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Load rate limit data from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth_rate_limits');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRateLimitStates(parsed);
      } catch (error) {
        console.error('Failed to parse rate limit data:', error);
      }
    }
  }, []);

  // Save rate limit data to localStorage
  const saveToStorage = useCallback((states: Record<string, RateLimitState>) => {
    try {
      localStorage.setItem('auth_rate_limits', JSON.stringify(states));
    } catch (error) {
      console.error('Failed to save rate limit data:', error);
    }
  }, []);

  // Update remaining time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let hasActiveLimit = false;
      let minRemainingTime = Infinity;

      Object.values(rateLimitStates).forEach(state => {
        if (state.blockedUntil && state.blockedUntil > now) {
          hasActiveLimit = true;
          const remaining = state.blockedUntil - now;
          if (remaining < minRemainingTime) {
            minRemainingTime = remaining;
          }
        }
      });

      setIsRateLimited(hasActiveLimit);
      setRemainingTime(hasActiveLimit ? Math.ceil(minRemainingTime / 1000) : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitStates]);

  const getKey = useCallback((operation: string, identifier: string) => {
    return `${operation}:${identifier}`;
  }, []);

  const checkRateLimit = useCallback((operation: string, identifier: string): boolean => {
    const key = getKey(operation, identifier);
    const now = Date.now();
    const state = rateLimitStates[key];

    if (!state) {
      return true; // No previous attempts
    }

    // Check if currently blocked
    if (state.blockedUntil && state.blockedUntil > now) {
      return false;
    }

    // Check if window has expired
    if (now - state.lastAttempt > windowMs) {
      return true; // Window expired, allow attempt
    }

    // Check if under limit
    return state.attempts < maxAttempts;
  }, [rateLimitStates, windowMs, maxAttempts, getKey]);

  const recordAttempt = useCallback((operation: string, identifier: string) => {
    const key = getKey(operation, identifier);
    const now = Date.now();
    
    setRateLimitStates(prev => {
      const current = prev[key];
      let newState: RateLimitState;

      if (!current || now - current.lastAttempt > windowMs) {
        // First attempt or window expired
        newState = {
          attempts: 1,
          lastAttempt: now
        };
      } else {
        // Increment attempts
        const newAttempts = current.attempts + 1;
        newState = {
          attempts: newAttempts,
          lastAttempt: now,
          blockedUntil: newAttempts >= maxAttempts ? now + blockDurationMs : current.blockedUntil
        };
      }

      const newStates = { ...prev, [key]: newState };
      saveToStorage(newStates);
      return newStates;
    });
  }, [getKey, windowMs, maxAttempts, blockDurationMs, saveToStorage]);

  const clearRateLimit = useCallback((operation: string, identifier: string) => {
    const key = getKey(operation, identifier);
    setRateLimitStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      saveToStorage(newStates);
      return newStates;
    });
  }, [getKey, saveToStorage]);

  return {
    isRateLimited,
    remainingTime,
    checkRateLimit,
    recordAttempt,
    clearRateLimit
  };
};
