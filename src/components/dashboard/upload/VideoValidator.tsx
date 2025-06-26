
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from '@/hooks/use-toast';

export const useVideoValidator = () => {
  const { role } = useUserRole();

  const validateVideoFile = async (
    file: File,
    isOnline: boolean,
    setIsValidating?: (validating: boolean) => void,
    setValidationError?: (error: string | null) => void
  ) => {
    if (!isOnline) {
      setValidationError?.("No internet connection for validation");
      return;
    }

    setIsValidating?.(true);
    setValidationError?.(null);

    try {
      // Quick file type validation first
      if (!file.type.startsWith('video/')) {
        throw new Error('Not a valid video file');
      }

      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;
        let metadataLoaded = false;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', onError);
          video.removeEventListener('loadstart', onLoadStart);
          URL.revokeObjectURL(url);
        };

        const onLoadStart = () => {
          console.log('Video load started for validation');
        };

        const onLoaded = () => {
          try {
            metadataLoaded = true;
            
            // Check for valid video dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
              reject(new Error('Invalid video: No video track detected or corrupted file'));
              return;
            }
            
            // Check for valid duration
            if (!video.duration || video.duration === 0 || !isFinite(video.duration)) {
              reject(new Error('Invalid video: Cannot read video duration or file is corrupted'));
              return;
            }

            // Role-based duration limits
            const maxDuration = (role === 'admin' || role === 'service_provider') ? 600 : 180;
            if (video.duration > maxDuration) {
              reject(new Error(`Video too long: Maximum ${maxDuration/60} minutes for ${role} accounts`));
              return;
            }

            // Warn about large video dimensions
            if (video.videoWidth > 1920 || video.videoHeight > 1920) {
              toast({
                title: "Large video detected",
                description: "Upload may take longer on mobile data",
              });
            }

            // Check for reasonable aspect ratio
            const aspectRatio = video.videoWidth / video.videoHeight;
            if (aspectRatio > 5 || aspectRatio < 0.2) {
              toast({
                title: "Unusual aspect ratio",
                description: "Video might not display optimally in feed",
              });
            }

            cleanup();
            resolve(void 0);
          } catch (error) {
            cleanup();
            reject(error);
          }
        };
        
        const onError = (e: Event) => {
          console.error('Video validation error:', e);
          cleanup();
          reject(new Error('Cannot process video file - may be corrupted or unsupported format'));
        };

        // Set timeout based on file size - larger files need more time
        const timeoutDuration = Math.min(10000, Math.max(3000, file.size / (1024 * 1024) * 500));
        timeoutId = setTimeout(() => {
          cleanup();
          if (!metadataLoaded) {
            reject(new Error('Video validation timeout - file may be corrupted or connection is too slow'));
          }
        }, timeoutDuration);
        
        video.addEventListener('loadstart', onLoadStart);
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);
        video.preload = 'metadata';
        video.src = url;
      });

    } catch (error: any) {
      console.error('Video validation failed:', error);
      setValidationError?.(error.message);
    } finally {
      setIsValidating?.(false);
    }
  };

  return { validateVideoFile };
};
