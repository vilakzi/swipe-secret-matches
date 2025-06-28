
import { toast } from '@/hooks/use-toast';
import { getUploadErrorMessage } from '@/utils/errorMessages';

export const handleUploadError = (error: any) => {
  console.error('Mobile upload error:', error);
  
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
      description: "Please check your mobile connection and try again",
      variant: "destructive"
    });
    return false;
  }

  // Enhanced mobile connection quality check
  const connection = (navigator as any).connection;
  if (connection) {
    console.log('Mobile network info:', {
      type: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });

    // More lenient for mobile - allow slower connections
    if (connection.effectiveType === 'slow-2g' && connection.downlink < 0.1) {
      toast({
        title: "Very slow connection",
        description: "Your connection is very slow. Upload may take longer but will continue.",
        variant: "default"
      });
    }
  }

  // Quick mobile connection test
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Very short timeout
    
    const response = await fetch('https://galrcqwogqqdsqdzfrrd.supabase.co/rest/v1/', {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHJjcXdvZ3FxZHNxZHpmcnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzQ1MDUsImV4cCI6MjA2NDA1MDUwNX0.95iX-m8r0TqDOS0_kR-3-1xgiZMofPARvMZHzyFrPf0'
      }
    });
    
    clearTimeout(timeoutId);
    console.log('Mobile connection test passed');
    return true;
  } catch (error: any) {
    console.warn('Mobile connection test failed, but allowing upload:', error.message);
    // Don't block upload based on connection test failure - mobile networks can be flaky
    return true;
  }
};

// Enhanced mobile network monitoring
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
      description: "Your uploads will resume when connection is restored",
      variant: "destructive",
    });
  };

  // Mobile-specific network change handling
  const handleConnectionChange = () => {
    const connection = (navigator as any).connection;
    if (connection) {
      console.log('Mobile connection changed:', connection.effectiveType);
      
      if (connection.effectiveType === 'slow-2g') {
        toast({
          title: "Slow connection detected",
          description: "Uploads may take longer on this connection",
          variant: "default"
        });
      }
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Listen for mobile network changes
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', handleConnectionChange);
  }

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (connection) {
      connection.removeEventListener('change', handleConnectionChange);
    }
  };
};

// Mobile-optimized retry mechanism with shorter delays
export const retryUploadWithFallback = async (uploadFn: () => Promise<any>, maxRetries = 5): Promise<any> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Mobile upload attempt ${attempt}/${maxRetries}`);
      
      const result = await uploadFn();
      if (result) {
        console.log(`Mobile upload succeeded on attempt ${attempt}`);
        return result;
      }
    } catch (error: any) {
      lastError = error;
      console.error(`Mobile upload attempt ${attempt} failed:`, error.message);
      
      // Don't retry for certain error types
      if (error.message?.includes('unauthorized') || 
          error.message?.includes('forbidden') ||
          error.message?.includes('invalid file type') ||
          error.message?.includes('file too large')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        // Shorter delays for mobile
        const delay = Math.min(500 * attempt, 3000);
        console.log(`Retrying mobile upload in ${delay}ms`);
        
        if (attempt <= 2) {
          toast({
            title: `Upload attempt ${attempt} failed`,
            description: `Retrying in ${Math.ceil(delay / 1000)} seconds...`,
            variant: "default"
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All mobile upload attempts failed');
  throw lastError;
};
