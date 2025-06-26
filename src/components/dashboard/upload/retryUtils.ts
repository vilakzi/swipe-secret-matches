
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`Operation attempt ${attempt} failed:`, error);
      
      // Don't retry for certain error types
      if (
        error.message?.includes('unauthorized') ||
        error.message?.includes('forbidden') ||
        error.message?.includes('invalid file type') ||
        error.message?.includes('file too large') ||
        error.message?.includes('Bucket not found') ||
        error.message?.includes('Invalid file type') ||
        error.message?.includes('You need to be logged in')
      ) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000);
      console.log(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
