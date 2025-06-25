
import { supabase } from '@/integrations/supabase/client';
import { retryOperation } from './retryUtils';

export const uploadFileToStorage = async (
  fileName: string, 
  file: File,
  onProgress?: (progress: number) => void
) => {
  console.log(`Starting upload: ${fileName}, size: ${file.size} bytes`);
  
  onProgress?.(10);

  // Validate file before upload
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('Invalid file type. Please upload an image or video file.');
  }

  if (file.size > 100 * 1024 * 1024) { // 100MB limit
    throw new Error('File too large. Maximum size is 100MB.');
  }

  const uploadData = await retryOperation(async () => {
    const { data, error } = await supabase.storage
      .from('posts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Storage upload error:', error);
      
      // Handle specific error types
      if (error.message?.includes('Bucket not found')) {
        throw new Error('Storage not configured. Please contact support.');
      }
      
      if (error.message?.includes('File size too large')) {
        throw new Error('File too large. Please select a smaller file.');
      }
      
      if (error.message?.includes('Invalid file type')) {
        throw new Error('Invalid file type. Please upload an image or video.');
      }
      
      if (error.message?.includes('Unauthorized')) {
        throw new Error('You need to be logged in to upload files.');
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data;
  });

  onProgress?.(60);

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);

  if (!publicUrl) {
    throw new Error('Failed to generate public URL for uploaded file');
  }

  onProgress?.(80);
  
  console.log('Upload successful:', publicUrl);
  return publicUrl;
};
