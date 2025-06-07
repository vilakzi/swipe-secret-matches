
import React, { ReactNode } from 'react';
import { sanitizeFormData, validateAndSanitizeInput } from '@/utils/enhancedInputValidation';
import { toast } from '@/hooks/use-toast';

interface SecureFormProps {
  children: ReactNode;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  className?: string;
}

const SecureForm: React.FC<SecureFormProps> = ({ children, onSubmit, className = '' }) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data: Record<string, any> = {};
    
    // Extract and validate form data
    let hasErrors = false;
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        const validation = validateAndSanitizeInput(value);
        
        if (!validation.isValid) {
          toast({
            title: "Validation Error",
            description: `${key}: ${validation.error}`,
            variant: "destructive",
          });
          hasErrors = true;
          continue;
        }
        
        data[key] = validation.sanitizedValue || value;
      } else {
        data[key] = value;
      }
    }
    
    if (hasErrors) {
      return;
    }
    
    // Sanitize the entire data object
    const sanitizedData = sanitizeFormData(data);
    
    try {
      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Error",
        description: "An error occurred while processing your request.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

export default SecureForm;
