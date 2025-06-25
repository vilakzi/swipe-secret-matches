
import { toast } from '@/hooks/use-toast';
import { getUploadErrorMessage } from '@/utils/errorMessages';

export const handleUploadError = (error: any) => {
  console.error('Upload error:', error);
  
  const message = getUploadErrorMessage(error);
  
  toast({
    title: "Upload Failed",
    description: message,
    variant: "destructive"
  });
};

export const checkNetworkConnection = () => {
  if (!navigator.onLine) {
    toast({
      title: "No internet connection",
      description: "Please check your connection and try again",
      variant: "destructive"
    });
    return false;
  }

  // Enhanced connection quality check
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.effectiveType === 'slow-2g') {
      toast({
        title: "Slow connection detected",
        description: "Upload may take longer than usual. Consider using a smaller file.",
        variant: "default"
      });
    } else if (connection.downlink < 1) {
      toast({
        title: "Poor connection quality",
        description: "Your connection seems unstable. Upload may fail or take longer.",
        variant: "default"
      });
    }
  }

  return true;
};

// Enhanced network monitoring with better error messages
export const monitorNetworkStatus = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => {
    callback(true);
    toast({
      title: "Connection restored",
      description: "You can now upload files again",
    });
  };

  const handleOffline = () => {
    callback(false);
    toast({
      title: "Connection lost",
      description: "Your uploads will be paused until connection is restored",
      variant: "destructive",
    });
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Retry mechanism for failed uploads
export const retryUploadWithFallback = async (uploadFn: () => Promise<any>, maxRetries = 3): Promise<any> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uploadFn();
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      // Don't retry for certain error types
      if (error.message?.includes('unauthorized') || 
          error.message?.includes('forbidden') ||
          error.message?.includes('invalid file type') ||
          error.message?.includes('file too large')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying upload in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        
        toast({
          title: `Upload failed (attempt ${attempt}/${maxRetries})`,
          description: `Retrying in ${Math.ceil(delay / 1000)} seconds...`,
          variant: "default"
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
