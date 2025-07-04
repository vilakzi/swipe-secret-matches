
// Input sanitization utilities for security
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/style\s*=/gi, '') // Remove style attributes
    .replace(/src\s*=/gi, '') // Remove src attributes
    .replace(/href\s*=/gi, '') // Remove href attributes
    .slice(0, 1000); // Limit length to prevent DoS
};

export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }

  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Basic phone number validation (7-15 digits)
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { isValid: false, error: "Phone number must be between 7-15 digits" };
  }

  // Check for suspicious patterns
  if (/^(.)\1{6,}$/.test(cleanPhone)) {
    return { isValid: false, error: "Invalid phone number format" };
  }

  return { isValid: true };
};

export const sanitizeDisplayName = (name: string): string => {
  if (!name) return '';
  
  return name
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .slice(0, 50); // Limit length
};
