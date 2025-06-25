
import { supabase } from '@/integrations/supabase/client';
import { retryOperation } from './retryUtils';

export const uploadFileToStorage = async (
  fileName: string, 
  file: File,
  onProgress?: (progress: number) => void
) => {
  console.log(`Starting upload: ${fileName}, size: ${file.size} bytes`);
  
  onProgress?.(10);

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
      throw new Error(`Upload failed: ${error.message}`);
    }

    return data;
  });

  onProgress?.(60);

  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(fileName);

  if (!publicUrl) {
    throw new Error('Failed to generate public URL');
  }

  onProgress?.(80);
  
  return publicUrl;
};
