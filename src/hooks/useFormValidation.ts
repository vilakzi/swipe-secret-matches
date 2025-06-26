
import { useState, useCallback } from 'react';
import { validateEmail } from '@/utils/emailValidation';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be less than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      if (name === 'email') {
        return 'Please enter a valid email address';
      }
      return `Invalid ${name} format`;
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validate = useCallback((formData: Record<string, any>): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const fieldValue = formData[fieldName];
      // Convert any value to string for validation, but skip boolean fields that don't need validation
      const stringValue = typeof fieldValue === 'string' ? fieldValue : String(fieldValue || '');
      
      // Skip validation for boolean fields that don't have validation rules
      if (typeof fieldValue === 'boolean' && !rules[fieldName].required) {
        return;
      }
      
      const error = validateField(fieldName, stringValue);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField, rules]);

  const validateSingleField = useCallback((name: string, value: string) => {
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    return !error;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validate,
    validateSingleField,
    clearErrors,
  };
};

// Common validation rules
export const authValidationRules: ValidationRules = {
  email: {
    required: true,
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    custom: (value: string) => {
      const validation = validateEmail(value);
      return validation.isValid ? null : validation.error || 'Invalid email';
    }
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128,
  },
  displayName: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  phone: {
    required: false,
    minLength: 8,
    pattern: /^\+?[\d\s\-\(\)]{8,}$/,
  }
};
