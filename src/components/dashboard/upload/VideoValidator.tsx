
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
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          video.removeEventListener('loadedmetadata', onLoaded);
          video.removeEventListener('error', onError);
          URL.revokeObjectURL(url);
        };

        const onLoaded = () => {
          try {
            if (video.videoWidth === 0 || video.videoHeight === 0) {
              reject(new Error('Invalid video: No video track detected'));
              return;
            }
            
            if (video.duration === 0 || !isFinite(video.duration)) {
              reject(new Error('Invalid video: Cannot read video duration'));
              return;
            }

            const maxDuration = (role === 'admin' || role === 'service_provider') ? 600 : 180;
            if (video.duration > maxDuration) {
              reject(new Error(`Video too long: Maximum ${maxDuration/60} minutes for ${role} accounts`));
              return;
            }

            if (video.videoWidth > 1920 || video.videoHeight > 1920) {
              toast({
                title: "Large video detected",
                description: "Upload may take longer on mobile",
              });
            }

            cleanup();
            resolve(void 0);
          } catch (error) {
            cleanup();
            reject(error);
          }
        };
        
        const onError = () => {
          cleanup();
          reject(new Error('Cannot process video file - may be corrupted'));
        };

        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Video validation timeout - check connection'));
        }, 3000);
        
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
