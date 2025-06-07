
import { validateUserInput, sanitizeUrl } from '@/utils/securityValidation';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export const validateAndSanitizeInput = (
  input: string,
  type: 'text' | 'email' | 'url' | 'phone' = 'text'
): ValidationResult => {
  // Basic security validation
  if (!validateUserInput(input)) {
    return {
      isValid: false,
      error: 'Input contains potentially malicious content'
    };
  }

  // Type-specific validation
  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        return {
          isValid: false,
          error: 'Invalid email format'
        };
      }
      break;

    case 'url':
      const sanitizedUrl = sanitizeUrl(input);
      if (!sanitizedUrl) {
        return {
          isValid: false,
          error: 'Invalid or unsafe URL'
        };
      }
      return {
        isValid: true,
        sanitizedValue: sanitizedUrl
      };

    case 'phone':
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(input)) {
        return {
          isValid: false,
          error: 'Invalid phone number format'
        };
      }
      break;

    case 'text':
    default:
      // Additional text validation
      if (input.length > 5000) {
        return {
          isValid: false,
          error: 'Input exceeds maximum length'
        };
      }
      break;
  }

  return {
    isValid: true,
    sanitizedValue: input.trim()
  };
};

export const validateFileUpload = (file: File): ValidationResult => {
  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds 10MB limit'
    };
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed'
    };
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.php$/i,
    /\.jsp$/i,
    /\.asp$/i
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
    return {
      isValid: false,
      error: 'File type not allowed'
    };
  }

  return {
    isValid: true
  };
};

export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      const validation = validateAndSanitizeInput(value);
      if (validation.isValid) {
        sanitized[key] = validation.sanitizedValue || value;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
