
// Centralized error message mapping for better user experience
export const getAuthErrorMessage = (error: any): string => {
  const message = error?.message?.toLowerCase() || '';
  
  // Supabase specific errors
  if (message.includes('invalid login credentials')) {
    return 'The email or password you entered is incorrect. Please try again.';
  }
  
  if (message.includes('email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  
  if (message.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  
  if (message.includes('password')) {
    if (message.includes('weak') || message.includes('short')) {
      return 'Password must be at least 8 characters long and contain a mix of letters and numbers.';
    }
    return 'Please check your password and try again.';
  }
  
  if (message.includes('email')) {
    if (message.includes('invalid')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('rate limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }
    return 'There was an issue with your email address. Please try again.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Connection failed. Please check your internet connection and try again.';
  }
  
  if (message.includes('timeout')) {
    return 'The request timed out. Please try again.';
  }
  
  if (message.includes('unauthorized') || message.includes('forbidden')) {
    return 'Access denied. Please sign in again.';
  }
  
  // Generic fallback
  return 'Something went wrong. Please try again or contact support if the problem persists.';
};

export const getUploadErrorMessage = (error: any): string => {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('file too large') || message.includes('size')) {
    return 'File is too large. Please choose a smaller file (max 10MB).';
  }
  
  if (message.includes('invalid file type') || message.includes('format')) {
    return 'Invalid file type. Please upload a JPEG, PNG, or MP4 file.';
  }
  
  if (message.includes('storage')) {
    return 'Storage error. Please try uploading again in a moment.';
  }
  
  if (message.includes('quota') || message.includes('limit')) {
    return 'Upload limit reached. Please try again later or upgrade your plan.';
  }
  
  if (message.includes('network') || message.includes('connection')) {
    return 'Upload failed due to connection issues. Please check your internet and try again.';
  }
  
  return 'Upload failed. Please try again or contact support if the problem persists.';
};

export const getGenericErrorMessage = (error: any, operation: string = 'operation'): string => {
  if (!navigator.onLine) {
    return 'You appear to be offline. Please check your connection and try again.';
  }
  
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch')) {
    return `${operation} failed due to network issues. Please try again.`;
  }
  
  if (message.includes('timeout')) {
    return `${operation} timed out. Please try again.`;
  }
  
  if (message.includes('server') || message.includes('500')) {
    return `Server error during ${operation}. Please try again in a moment.`;
  }
  
  return `${operation} failed. Please try again or contact support if the problem persists.`;
};
