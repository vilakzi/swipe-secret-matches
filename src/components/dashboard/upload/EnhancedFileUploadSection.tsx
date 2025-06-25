
import React, { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";
import FileInput from './FileInput';
import FileStatusDisplay from './FileStatusDisplay';
import MobileUploadOptimizer from './MobileUploadOptimizer';
import MobileNetworkDetector from './MobileNetworkDetector';
import { useVideoValidator } from './VideoValidator';

interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  isSlowConnection: boolean;
  effectiveType: string;
}

interface EnhancedFileUploadSectionProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  validationError?: string | null;
  isValidating?: boolean;
  setValidationError?: (error: string | null) => void;
  setIsValidating?: (validating: boolean) => void;
  uploadError?: string | null;
}

const EnhancedFileUploadSection: React.FC<EnhancedFileUploadSectionProps> = ({
  selectedFile,
  onFileChange,
  validationError,
  isValidating,
  setValidationError,
  setIsValidating,
  uploadError
}) => {
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);
  const { validateVideoFile } = useVideoValidator();
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    isSlowConnection: false,
    effectiveType: 'unknown'
  });

  const handleNetworkChange = useCallback((info: NetworkInfo) => {
    setNetworkInfo(info);
  }, []);

  const handleFileValidation = useCallback(async (file: File) => {
    if (!networkInfo.isOnline) {
      setValidationError?.('No internet connection for file validation');
      return;
    }

    if (file.type.startsWith('video/')) {
      await validateVideoFile(file, networkInfo.isOnline, setIsValidating, setValidationError);
    } else {
      setValidationError?.(null);
    }
  }, [networkInfo.isOnline, validateVideoFile, setIsValidating, setValidationError]);

  const handleOptimizedFile = useCallback((optimizedFile: File) => {
    onFileChange(optimizedFile);
    
    if (optimizedFile) {
      const url = URL.createObjectURL(optimizedFile);
      setPreviewUrl(url);
      handleFileValidation(optimizedFile);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setValidationError?.(null);
    }
  }, [onFileChange, handleFileValidation, setValidationError]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!networkInfo.isOnline) {
      toast({
        title: "No internet connection",
        description: "Please check your connection before selecting files",
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
          description: "Please select an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV)",
          variant: "destructive",
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `Maximum: ${Math.round(maxSize / (1024*1024))}MB for ${role} accounts`,
          variant: "destructive",
        });
        return;
      }

      // Warn about large files on slow connections
      if (networkInfo.isSlowConnection && file.size > 10 * 1024 * 1024) {
        toast({
          title: "Large file on slow connection",
          description: "This may take a while to upload. Consider using a smaller file or better connection.",
        });
      }

      // Pass to optimizer first
      onFileChange(file);
    }
  }, [networkInfo, maxSize, role, onFileChange]);

  const removeFile = useCallback(() => {
    onFileChange(null);
    setValidationError?.(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    toast({
      title: "File removed",
      description: "Select another file to upload",
    });
  }, [onFileChange, setValidationError, previewUrl]);

  const isFileReady = selectedFile && !isValidating && !validationError && !uploadError && networkInfo.isOnline;

  return (
    <div className="space-y-4">
      <MobileNetworkDetector onNetworkChange={handleNetworkChange} />
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Image or Video
        </label>
        
        {!selectedFile ? (
          <FileInput isOnline={networkInfo.isOnline} onFileChange={handleFileChange} />
        ) : (
          <>
            <MobileUploadOptimizer
              file={selectedFile}
              onOptimizedFile={handleOptimizedFile}
              onError={(error) => setValidationError?.(error)}
            />
            <FileStatusDisplay
              file={selectedFile}
              validationError={validationError}
              isValidating={isValidating}
              isOnline={networkInfo.isOnline}
              previewUrl={previewUrl}
              onRemove={removeFile}
            />
          </>
        )}
      </div>

      {/* Upload Tips for Mobile */}
      {networkInfo.isSlowConnection && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
          <div className="text-blue-400 text-sm">
            <strong>Slow connection tips:</strong>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Keep your screen on during upload</li>
              <li>• Stay on this page until upload completes</li>
              <li>• Consider using WiFi for faster uploads</li>
            </ul>
          </div>
        </div>
      )}

      {/* File Status */}
      {isFileReady && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="text-green-400 text-sm font-medium">
            ✓ File ready for upload
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFileUploadSection;
