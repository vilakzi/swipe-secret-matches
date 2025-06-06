
// Security validation utilities
export const validateUserInput = (input: any): boolean => {
  if (typeof input !== 'string') return false;
  
  // Check for common injection patterns
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];
  
  return !maliciousPatterns.some(pattern => pattern.test(input));
};

export const rateLimit = (() => {
  const attempts = new Map<string, { count: number; lastAttempt: number }>();
  
  return (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);
    
    if (!userAttempts) {
      attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Reset if window has passed
    if (now - userAttempts.lastAttempt > windowMs) {
      attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // Check if limit exceeded
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    // Increment attempts
    userAttempts.count++;
    userAttempts.lastAttempt = now;
    
    return true;
  };
})();

export const sanitizeUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const parsedUrl = new URL(url);
    
    // Only allow https and http protocols
    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      return null;
    }
    
    return parsedUrl.toString();
  } catch {
    return null;
  }
};
