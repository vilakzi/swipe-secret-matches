
import * as React from 'react';
import FileUploadSection from './FileUploadSection';

interface EnhancedFileUploadSectionProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  validationError?: string | null;
  isValidating?: boolean;
  setValidationError?: (error: string | null) => void;
  setIsValidating?: (validating: boolean) => void;
  uploadError?: string | null;
}

const EnhancedFileUploadSection = (props: EnhancedFileUploadSectionProps) => {
  return <FileUploadSection {...props} />;
};

export default EnhancedFileUploadSection;
