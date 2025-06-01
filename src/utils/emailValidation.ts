
// Comprehensive email validation utility
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  if (!email.trim()) {
    return { isValid: false, error: "Email cannot be empty" };
  }

  // Check basic format
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  // Check for common issues
  if (email.length > 254) {
    return { isValid: false, error: "Email address is too long" };
  }

  if (email.includes('..')) {
    return { isValid: false, error: "Email address cannot contain consecutive dots" };
  }

  if (email.startsWith('.') || email.endsWith('.')) {
    return { isValid: false, error: "Email address cannot start or end with a dot" };
  }

  const [localPart, domain] = email.split('@');
  
  if (localPart.length > 64) {
    return { isValid: false, error: "Email username part is too long" };
  }

  if (domain.length > 253) {
    return { isValid: false, error: "Email domain is too long" };
  }

  return { isValid: true };
};

export const getEmailErrorMessage = (email: string): string | null => {
  const validation = validateEmail(email);
  return validation.error || null;
};

// Test with various email providers
export const testEmailProviders = [
  'test@gmail.com',
  'user@yahoo.com',
  'contact@outlook.com',
  'support@company.co.uk',
  'admin@subdomain.example.org',
  'user.name+tag@domain.com',
  'firstname.lastname@enterprise.com'
];
