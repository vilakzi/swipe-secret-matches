
import { supabase } from '@/integrations/supabase/client';
import { retryOperation } from './retryUtils';

export const uploadFileToStorage = async (
  fileName: string, 
  file: File,
  onProgress?: (progress: number) => void
) => {
  console.log(`Starting upload: ${fileName}, size: ${file.size} bytes`);
  
  onProgress?.(5);

  // Enhanced file validation
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('Invalid file type. Please upload an image or video file.');
  }

  if (file.size > 100 * 1024 * 1024) { // 100MB limit
    throw new Error('File too large. Maximum size is 100MB.');
  }

  if (file.size === 0) {
    throw new Error('File is empty. Please select a valid file.');
  }

  onProgress?.(10);

  // Check network connection
  if (!navigator.onLine) {
    throw new Error('No internet connection. Please check your connection and try again.');
  }

  const uploadData = await retryOperation(async () => {
    // Create a more specific file path for better organization
    const timestamp = Date.now();
    const finalFileName = `${timestamp}-${fileName}`;
    
    onProgress?.(20);

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    onProgress?.(60);

    if (error) {
      console.error('Storage upload error:', error);
      
      // Enhanced error handling with mobile-specific messages
      if (error.message?.includes('Bucket not found')) {
        throw new Error('Storage not configured. Please contact support.');
      }
      
      if (error.message?.includes('File size too large') || error.message?.includes('413')) {
        throw new Error('File too large. Please select a smaller file.');
      }
      
      if (error.message?.includes('Invalid file type') || error.message?.includes('415')) {
        throw new Error('Invalid file type. Please upload an image or video.');
      }
      
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        throw new Error('You need to be logged in to upload files.');
      }

      if (error.message?.includes('Network') || error.message?.includes('timeout')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      if (error.message?.includes('Storage quota')) {
        throw new Error('Storage limit reached. Please contact support.');
      }
      
      // Generic error with original message for debugging
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data;
  }, 3, 2000); // 3 retries with 2 second base delay

  onProgress?.(70);

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(uploadData.path);

  if (!publicUrl) {
    throw new Error('Failed to generate public URL for uploaded file');
  }

  onProgress?.(90);
  
  console.log('Upload successful:', publicUrl);
  onProgress?.(100);
  
  return publicUrl;
};
