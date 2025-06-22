
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Image, Video, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
}

const FileUploadSection = ({ selectedFile, onFileChange }: FileUploadSectionProps) => {
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status for mobile
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection restored",
        description: "You're back online!",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection lost",
        description: "Please check your internet connection",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      
      // Validate video files with mobile-optimized checks
      if (selectedFile.type.startsWith('video/')) {
        validateVideoFile(selectedFile);
      } else {
        // Reset validation for image files
        setValidationError(null);
      }
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setValidationError(null);
    }
  }, [selectedFile]);

  const validateVideoFile = async (file: File) => {
    if (!isOnline) {
      setValidationError("No internet connection for validation");
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Mobile-optimized video validation with shorter timeout
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
            // Check if video has valid dimensions and duration
            if (video.videoWidth === 0 || video.videoHeight === 0) {
              reject(new Error('Invalid video: No video track found'));
              return;
            }
            
            if (video.duration === 0 || isNaN(video.duration)) {
              reject(new Error('Invalid video: Cannot determine duration'));
              return;
            }

            // Check reasonable video duration (max 5 minutes for mobile)
            if (video.duration > 300) {
              reject(new Error('Video too long: Maximum 5 minutes allowed'));
              return;
            }

            // Check video resolution for mobile optimization
            if (video.videoWidth > 1920 || video.videoHeight > 1920) {
              toast({
                title: "Large video detected",
                description: "Video may take longer to upload on mobile",
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
          reject(new Error('Cannot decode video file'));
        };

        // Reduced timeout for mobile (5 seconds)
        timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error('Video validation timeout (poor connection?)'));
        }, 5000);
        
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);
        video.preload = 'metadata';
        video.src = url;
      });

    } catch (error: any) {
      console.error('Video validation failed:', error);
      setValidationError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!isOnline) {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
      return;
    }

    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `Maximum allowed: ${Math.round(maxSize / (1024*1024))}MB`,
          variant: "destructive",
        });
        return;
      }

      // Mobile-specific file size warnings
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Large file warning",
          description: "Large files may take longer to upload on mobile",
        });
      }

      onFileChange(file);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    setValidationError(null);
    toast({
      title: "File removed",
      description: "Please select another file to upload",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFileReady = selectedFile && !isValidating && !validationError && isOnline;

  return (
    <div className="space-y-4">
      {/* Network Status Indicator */}
      {!isOnline && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              No internet connection - uploads unavailable
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Image or Video
        </label>
        {!selectedFile ? (
          <>
            <Input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={!isOnline}
              className="bg-gray-800 border-gray-600 text-white file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                Max file size: {Math.round(maxSize / (1024*1024))}MB
              </p>
              <div className="flex items-center space-x-1">
                {isOnline ? (
                  <Wifi className="w-3 h-3 text-green-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-400" />
                )}
                <span className="text-xs text-gray-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {selectedFile.type.startsWith('image/') ? (
                    <Image className="w-8 h-8 text-green-400" />
                  ) : (
                    <Video className="w-8 h-8 text-green-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type.startsWith('image/') ? 'Image' : 'Video'}
                  </p>
                  
                  {isValidating && (
                    <div className="flex items-center mt-2">
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-yellow-400 text-sm font-medium">Validating...</span>
                    </div>
                  )}
                  
                  {validationError && (
                    <div className="flex items-center mt-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mr-2" />
                      <span className="text-red-400 text-sm font-medium">Validation failed</span>
                    </div>
                  )}
                  
                  {isFileReady && (
                    <div className="flex items-center mt-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-green-400 text-sm font-medium">Ready for upload</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {validationError && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-600/30 rounded text-red-400 text-sm">
                {validationError}
              </div>
            )}
            
            {/* Image or video preview - mobile optimized */}
            {selectedFile.type.startsWith('image/') && previewUrl && !validationError && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover object-center rounded"
                  style={{ aspectRatio: '16/9' }}
                  loading="lazy"
                />
              </div>
            )}
            {selectedFile.type.startsWith('video/') && previewUrl && !validationError && !isValidating && (
              <div className="mt-3 rounded-lg overflow-hidden">
                <video
                  src={previewUrl}
                  className="w-full h-32 object-cover object-center rounded"
                  style={{ aspectRatio: '16/9' }}
                  controls
                  preload="metadata"
                  playsInline
                  muted
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {isFileReady && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              File is ready! Click "Submit & Upload Post" to continue.
            </span>
          </div>
        </div>
      )}
      
      {validationError && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              Please select a different file. This file cannot be uploaded.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
