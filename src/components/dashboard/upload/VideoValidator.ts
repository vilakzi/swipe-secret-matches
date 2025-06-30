
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export const useVideoValidator = () => {
  const validateVideoFile = useCallback(async (
    file: File,
    isOnline: boolean,
    setIsValidating?: (validating: boolean) => void,
    setValidationError?: (error: string | null) => void
  ) => {
    if (!file.type.startsWith('video/')) {
      return;
    }

    setIsValidating?.(true);
    setValidationError?.(null);

    try {
      // Basic video validation
      const maxVideoSize = 50 * 1024 * 1024; // 50MB for videos
      if (file.size > maxVideoSize) {
        const error = 'Video file too large. Maximum size is 50MB.';
        setValidationError?.(error);
        toast({
          title: "Video too large",
          description: error,
          variant: "destructive"
        });
        return;
      }

      // Check video duration if possible
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const checkDuration = new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          if (video.duration > 300) { // 5 minutes max
            reject(new Error('Video duration exceeds 5 minutes limit'));
          } else {
            resolve();
          }
        };
        
        video.onerror = () => {
          reject(new Error('Invalid video file format'));
        };
        
        video.src = URL.createObjectURL(file);
      });

      await checkDuration;
      URL.revokeObjectURL(video.src);
      
    } catch (error: any) {
      console.error('Video validation error:', error);
      const errorMessage = error.message || 'Video validation failed';
      setValidationError?.(errorMessage);
      toast({
        title: "Video validation failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsValidating?.(false);
    }
  }, []);

  return { validateVideoFile };
};
