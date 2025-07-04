// Security headers utility for enhanced protection

export const getSecurityHeaders = () => {
  return {
    // Content Security Policy - prevent XSS attacks
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for React dev
      "style-src 'self' 'unsafe-inline'", // Required for CSS-in-JS
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "connect-src 'self' wss: https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // HTTPS only
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  };
};

export const applySecutityHeaders = (response: Response): Response => {
  const headers = getSecurityHeaders();
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
};