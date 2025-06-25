
import { toast } from '@/hooks/use-toast';

export const handleUploadError = (error: any) => {
  console.error('Upload error:', error);
  
  let errorMessage = "Upload failed";
  let errorDescription = "Please try again";

  if (!navigator.onLine) {
    errorMessage = "Connection lost";
    errorDescription = "Please check your internet connection";
  } else if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
    errorMessage = "Network timeout";
    errorDescription = "Poor connection detected. Try with a smaller file or better signal";
  } else if (error.message?.includes('size') || error.message?.includes('large')) {
    errorMessage = "File too large";
    errorDescription = "Please compress your file or try a smaller one";
  } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
    errorMessage = "Permission denied";
    errorDescription = "Please log out and log back in";
  } else if (error.message?.includes('storage')) {
    errorMessage = "Storage error";
    errorDescription = "Server storage issue. Please try again in a moment";
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
  return true;
};
