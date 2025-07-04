
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

export const validateFileUpload = async (file: File): Promise<ValidationResult> => {
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
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not allowed'
    };
  }

  // Magic number validation for enhanced security
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  const magicNumbers = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
    'video/mp4': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]]
  };

  const expectedMagic = magicNumbers[file.type as keyof typeof magicNumbers];
  if (expectedMagic) {
    const isValidMagic = expectedMagic.some(magic => 
      magic.every((byte, index) => bytes[index] === byte)
    );
    
    if (!isValidMagic) {
      return {
        isValid: false,
        error: 'File content does not match file type'
      };
    }
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.php$/i,
    /\.jsp$/i,
    /\.asp$/i,
    /\.js$/i,
    /\.html$/i,
    /\.htm$/i
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
