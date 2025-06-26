
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";
import NetworkStatusIndicator from './NetworkStatusIndicator';
import FileInput from './FileInput';
import FileStatusDisplay from './FileStatusDisplay';
import FileValidationMessages from './FileValidationMessages';
import UploadErrorHandler from './UploadErrorHandler';
import { useVideoValidator } from './VideoValidator';

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  validationError?: string | null;
  isValidating?: boolean;
  setValidationError?: (error: string | null) => void;
  setIsValidating?: (validating: boolean) => void;
  uploadError?: string | null;
}

const FileUploadSection = ({ 
  selectedFile, 
  onFileChange, 
  validationError, 
  isValidating,
  setValidationError,
  setIsValidating,
  uploadError
}: FileUploadSectionProps) => {
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);
  const { validateVideoFile } = useVideoValidator();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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
      
      if (selectedFile.type.startsWith('video/')) {
        validateVideoFile(selectedFile, isOnline, setIsValidating, setValidationError);
      } else {
        setValidationError?.(null);
      }
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
      setValidationError?.(null);
    }
  }, [selectedFile, isOnline, setValidationError, setIsValidating, validateVideoFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!isOnline) {
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

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "Large file warning",
          description: "Large files may upload slowly on mobile data",
        });
      }

      onFileChange(file);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    setValidationError?.(null);
    toast({
      title: "File removed",
      description: "Select another file to upload",
    });
  };

  const isFileReady = selectedFile && !isValidating && !validationError && !uploadError && isOnline;

  return (
    <div className="space-y-4">
      <NetworkStatusIndicator />
      
      <UploadErrorHandler error={uploadError ?? validationError ?? null} isOnline={isOnline} />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Image or Video
        </label>
        {!selectedFile ? (
          <FileInput isOnline={isOnline} onFileChange={handleFileChange} />
        ) : (
          <FileStatusDisplay
            file={selectedFile}
            validationError={validationError ?? null}
            isValidating={isValidating ?? false}
            isOnline={isOnline}
            previewUrl={previewUrl}
            onRemove={removeFile}
          />
        )}
      </div>

      <FileValidationMessages
        isFileReady={!!isFileReady}
        validationError={validationError ?? null}
      />
    </div>
  );
};

export default FileUploadSection;
