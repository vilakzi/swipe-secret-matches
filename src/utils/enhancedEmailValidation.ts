
import { validateEmail as basicValidateEmail } from './emailValidation';

// Enhanced email validation with additional security checks
export const validateEmailSecurity = (email: string): { isValid: boolean; error?: string } => {
  // First run basic validation
  const basicValidation = basicValidateEmail(email);
  if (!basicValidation.isValid) {
    return basicValidation;
  }

  // Additional security checks
  const trimmedEmail = email.trim().toLowerCase();
  
  // Check for suspicious patterns
  if (trimmedEmail.includes('..')) {
    return { isValid: false, error: "Email cannot contain consecutive dots" };
  }
  
  // Check for common temporary email domains (basic list)
  const tempEmailDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email'
  ];
  
  const domain = trimmedEmail.split('@')[1];
  if (tempEmailDomains.includes(domain)) {
    return { isValid: false, error: "Temporary email addresses are not allowed" };
  }
  
  // Check for suspicious characters
  const suspiciousPatterns = [
    /[<>]/,
    /javascript:/i,
    /['"]/
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(email))) {
    return { isValid: false, error: "Email contains invalid characters" };
  }
  
  return { isValid: true };
};
