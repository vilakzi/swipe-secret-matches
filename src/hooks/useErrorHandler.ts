
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { getAuthErrorMessage, getUploadErrorMessage, getGenericErrorMessage } from '@/utils/errorMessages';

export type ErrorType = 'auth' | 'upload' | 'network' | 'generic';

export const useErrorHandler = () => {
  const handleError = useCallback((
    error: any, 
    type: ErrorType = 'generic',
    operation?: string,
    customMessage?: string
  ) => {
    console.error(`${type} error:`, error);
    
    let message: string;
    
    if (customMessage) {
      message = customMessage;
    } else {
      switch (type) {
        case 'auth':
          message = getAuthErrorMessage(error);
          break;
        case 'upload':
          message = getUploadErrorMessage(error);
          break;
        default:
          message = getGenericErrorMessage(error, operation);
      }
    }
    
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
  }, []);

  const handleSuccess = useCallback((message: string, title: string = "Success") => {
    toast({
      title,
      description: message
    });
  }, []);

  return {
    handleError,
    handleSuccess
  };
};
