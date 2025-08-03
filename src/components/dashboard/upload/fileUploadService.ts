
import { supabase } from '@/integrations/supabase/client';
import { retryOperation } from './retryUtils';

export const uploadFileToStorage = async (
  fileName: string, 
  file: File,
  onProgress?: (progress: number) => void
) => {
  // Starting file upload process
  
  onProgress?.(5);

  // Basic file validation
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

  // Check connection
  if (!navigator.onLine) {
    throw new Error('No internet connection. Please check your connection and try again.');
  }

  onProgress?.(20);

  const uploadData = await retryOperation(async () => {
    // Create unique file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const finalFileName = `${timestamp}-${randomString}-${fileName}`;
    
    onProgress?.(30);

    // Attempting upload to Supabase storage
    
    const { data, error } = await supabase.storage
      .from('posts')
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    onProgress?.(70);

    if (error) {
      // Handle upload error with proper error messaging
      
      if (error.message?.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      if (error.message?.includes('timeout')) {
        throw new Error('Upload timeout. Please try with a smaller file or better connection.');
      }
      
      if (error.message?.includes('413') || error.message?.includes('File size too large')) {
        throw new Error('File too large for upload. Please select a smaller file.');
      }
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Authentication error. Please log out and log back in.');
      }

      if (error.message?.includes('400')) {
        throw new Error('Bad request. Please try selecting the file again.');
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Upload successful
    return data;
  }, 3, 2000);

  onProgress?.(80);

  // Get public URL
  try {
    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(uploadData.path);

    if (!publicUrl) {
      throw new Error('Failed to generate public URL for uploaded file');
    }

    onProgress?.(95);
    
    // Upload completed successfully
    onProgress?.(100);
    
    return publicUrl;
  } catch (error) {
    // Failed to get public URL - handle error gracefully
    throw new Error('Upload completed but failed to get file URL. Please try again.');
  }
};
