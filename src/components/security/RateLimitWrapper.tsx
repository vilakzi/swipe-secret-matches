
import React, { useState, useEffect, ReactNode } from 'react';
import { rateLimit } from '@/utils/securityValidation';
import { toast } from '@/hooks/use-toast';

interface RateLimitWrapperProps {
  children: ReactNode;
  identifier: string;
  maxAttempts?: number;
  windowMs?: number;
  onLimitExceeded?: () => void;
}

const RateLimitWrapper: React.FC<RateLimitWrapperProps> = ({
  children,
  identifier,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000, // 15 minutes
  onLimitExceeded
}) => {
  const [isBlocked, setIsBlocked] = useState(false);

  const checkRateLimit = () => {
    const allowed = rateLimit(identifier, maxAttempts, windowMs);
    
    if (!allowed) {
      setIsBlocked(true);
      toast({
        title: "Rate limit exceeded",
        description: "Too many attempts. Please try again later.",
        variant: "destructive",
      });
      
      if (onLimitExceeded) {
        onLimitExceeded();
      }
      
      // Reset block after window period
      setTimeout(() => {
        setIsBlocked(false);
      }, windowMs);
      
      return false;
    }
    
    return true;
  };

  if (isBlocked) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Access temporarily restricted due to rate limiting.</p>
      </div>
    );
  }

  return (
    <div onClick={checkRateLimit}>
      {children}
    </div>
  );
};

export default RateLimitWrapper;
