
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

export const checkNetworkConnection = async () => {
  if (!navigator.onLine) {
    toast({
      title: "No internet connection",
      description: "Please check your connection and try again",
      variant: "destructive"
    });
    return false;
  }

  // Enhanced connection quality check for mobile
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.effectiveType === 'slow-2g') {
      toast({
        title: "Very slow connection detected",
        description: "Upload may fail. Consider using WiFi or a smaller file.",
        variant: "destructive"
      });
      return false;
    } else if (connection.effectiveType === '2g') {
      toast({
        title: "Slow connection detected",
        description: "Upload may take longer than usual. Consider using WiFi.",
        variant: "default"
      });
    } else if (connection.downlink < 0.5) {
      toast({
        title: "Poor connection quality",
        description: "Your connection seems very unstable. Try moving to better signal area.",
        variant: "destructive"
      });
      return false;
    }
  }

  // Test actual connection by making a small request
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://galrcqwogqqdsqdzfrrd.supabase.co/rest/v1/', {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHJjcXdvZ3FxZHNxZHpmcnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzQ1MDUsImV4cCI6MjA2NDA1MDUwNX0.95iX-m8r0TqDOS0_kR-3-1xgiZMofPARvMZHzyFrPf0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      toast({
        title: "Server connection failed",
        description: "Cannot reach upload server. Please try again later.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Connection test failed:', error);
    
    if (error.name === 'AbortError') {
      toast({
        title: "Connection timeout",
        description: "Server response too slow. Please try again with better connection.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cannot reach server",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
    }
    return false;
  }
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

// Retry mechanism for failed uploads with mobile-specific handling
export const retryUploadWithFallback = async (uploadFn: () => Promise<any>, maxRetries = 3): Promise<any> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check connection before each retry
      const connectionOk = await checkNetworkConnection();
      if (!connectionOk && attempt > 1) {
        throw new Error('Connection check failed');
      }
      
      const result = await uploadFn();
      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      // Don't retry for certain error types
      if (error.message?.includes('unauthorized') || 
          error.message?.includes('forbidden') ||
          error.message?.includes('invalid file type') ||
          error.message?.includes('file too large') ||
          error.message?.includes('Very slow connection') ||
          error.message?.includes('Poor connection')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
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
