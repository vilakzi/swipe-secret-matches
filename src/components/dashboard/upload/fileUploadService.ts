
import { supabase } from '@/integrations/supabase/client';
import { retryOperation } from './retryUtils';

export const uploadFileToStorage = async (
  fileName: string, 
  file: File,
  onProgress?: (progress: number) => void
) => {
  console.log(`Starting mobile-optimized upload: ${fileName}, size: ${file.size} bytes`);
  
  onProgress?.(5);

  // Enhanced mobile file validation
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

  // Enhanced mobile connection check
  if (!navigator.onLine) {
    throw new Error('No internet connection. Please check your connection and try again.');
  }

  // Mobile-specific connection quality check
  const connection = (navigator as any).connection;
  if (connection) {
    console.log('Mobile connection info:', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    });
    
    if (connection.effectiveType === 'slow-2g' || connection.downlink < 0.15) {
      console.warn('Very slow connection detected, but proceeding with optimized upload');
    }
  }

  // Test connection with mobile-optimized timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Shorter timeout for mobile
    
    const response = await fetch('https://galrcqwogqqdsqdzfrrd.supabase.co/rest/v1/', {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbHJjcXdvZ3FxZHNxZHpmcnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0NzQ1MDUsImV4cCI6MjA2NDA1MDUwNX0.95iX-m8r0TqDOS0_kR-3-1xgiZMofPARvMZHzyFrPf0'
      }
    });
    
    clearTimeout(timeoutId);
    console.log('Mobile connection test successful');
  } catch (error: any) {
    console.warn('Connection test failed, but proceeding with upload:', error.message);
    // Don't throw here - continue with upload as connection test might fail but upload could work
  }

  onProgress?.(20);

  const uploadData = await retryOperation(async () => {
    // Create mobile-optimized file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const finalFileName = `mobile-${timestamp}-${randomString}-${fileName}`;
    
    onProgress?.(30);

    console.log('Attempting mobile-optimized upload to Supabase storage...');
    
    // Mobile-specific upload with smaller chunk size
    const uploadOptions = {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
      duplex: 'half' as RequestDuplex, // Mobile optimization
    };

    const { data, error } = await supabase.storage
      .from('posts')
      .upload(finalFileName, file, uploadOptions);

    onProgress?.(70);

    if (error) {
      console.error('Mobile upload error:', error);
      
      // Enhanced mobile-specific error handling
      if (error.message?.includes('fetch')) {
        throw new Error('Network error on mobile. Please check your connection and try again.');
      }
      
      if (error.message?.includes('timeout')) {
        throw new Error('Upload timeout on mobile. Please try with a smaller file or better connection.');
      }
      
      if (error.message?.includes('413') || error.message?.includes('File size too large')) {
        throw new Error('File too large for mobile upload. Please select a smaller file.');
      }
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Authentication error. Please log out and log back in.');
      }

      if (error.message?.includes('400')) {
        throw new Error('Bad request. Please try selecting the file again.');
      }
      
      // Generic mobile error
      throw new Error(`Mobile upload failed: ${error.message}`);
    }

    console.log('Mobile upload successful:', data);
    return data;
  }, 5, 1500); // More retries with shorter delay for mobile

  onProgress?.(80);

  // Get public URL with mobile error handling
  try {
    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(uploadData.path);

    if (!publicUrl) {
      throw new Error('Failed to generate public URL for uploaded file');
    }

    onProgress?.(95);
    
    console.log('Mobile upload completed successfully:', publicUrl);
    onProgress?.(100);
    
    return publicUrl;
  } catch (error) {
    console.error('Failed to get public URL on mobile:', error);
    throw new Error('Upload completed but failed to get file URL. Please try again.');
  }
};
