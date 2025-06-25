
import { toast } from '@/hooks/use-toast';

export const handleUploadError = (error: any) => {
  console.error('Upload error:', error);
  
  let errorMessage = "Upload failed";
  let errorDescription = "Please try again";

  if (!navigator.onLine) {
    errorMessage = "Connection lost";
    errorDescription = "Please check your internet connection and try again";
  } else if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
    errorMessage = "Network timeout";
    errorDescription = "Poor connection detected. Try with a smaller file or better signal";
  } else if (error.message?.includes('size') || error.message?.includes('large')) {
    errorMessage = "File too large";
    errorDescription = "Please compress your file or try a smaller one";
  } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
    errorMessage = "Permission denied";
    errorDescription = "Please log out and log back in to refresh your session";
  } else if (error.message?.includes('storage')) {
    errorMessage = "Storage error";
    errorDescription = "Server storage issue. Please try again in a moment";
  } else if (error.message?.includes('Invalid file') || error.message?.includes('extension')) {
    errorMessage = "Invalid file type";
    errorDescription = "Please select a supported image or video file";
  } else if (error.message?.includes('duplicate')) {
    errorMessage = "Duplicate content";
    errorDescription = "This file has already been uploaded";
  } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
    errorMessage = "Upload limit reached";
    errorDescription = "You've reached your upload limit. Please try again later";
  } else if (error.message?.includes('corrupted') || error.message?.includes('invalid')) {
    errorMessage = "File corrupted";
    errorDescription = "The file appears to be corrupted. Please try a different file";
  }

  toast({
    title: errorMessage,
    description: errorDescription,
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

  // Additional connection quality check with proper typing
  const connection = (navigator as any).connection;
  if (connection && connection.effectiveType === 'slow-2g') {
    toast({
      title: "Slow connection detected",
      description: "Upload may take longer than usual",
    });
  }

  return true;
};

// Enhanced network monitoring
export const monitorNetworkStatus = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => {
    callback(true);
    toast({
      title: "Connection restored",
      description: "You can now upload files",
    });
  };

  const handleOffline = () => {
    callback(false);
    toast({
      title: "Connection lost",
      description: "Please check your internet connection",
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
