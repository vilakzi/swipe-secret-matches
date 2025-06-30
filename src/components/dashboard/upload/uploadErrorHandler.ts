
import { toast } from '@/hooks/use-toast';

export const checkNetworkConnection = async (): Promise<boolean> => {
  if (!navigator.onLine) {
    toast({
      title: "No internet connection",
      description: "Please check your connection and try again",
      variant: "destructive"
    });
    return false;
  }

  try {
    // Test connection to Supabase
    const response = await fetch('https://galrcqwogqqdsqdzfrrd.supabase.co/rest/v1/', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.warn('Connection test failed:', error);
    return true; // Allow upload attempt even if test fails
  }
};

export const retryUploadWithFallback = async <T>(
  uploadFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Upload attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

export const handleUploadError = (error: any) => {
  console.error('Upload error:', error);
  
  let errorMessage = "Upload failed. Please try again.";
  
  if (error?.message) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error.message.includes('timeout')) {
      errorMessage = "Upload timeout. Please try with a smaller file.";
    } else if (error.message.includes('413') || error.message.includes('too large')) {
      errorMessage = "File too large. Please select a smaller file.";
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      errorMessage = "Authentication error. Please log out and log back in.";
    } else {
      errorMessage = error.message;
    }
  }
  
  toast({
    title: "Upload Failed",
    description: errorMessage,
    variant: "destructive"
  });
};
