
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";
import NetworkStatusIndicator from './NetworkStatusIndicator';
import FileInput from './FileInput';
import FileStatusDisplay from './FileStatusDisplay';
import FilePreview from './FilePreview';
import { useVideoValidator } from './VideoValidator';

interface FileUploadSectionProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  validationError?: string | null;
  isValidating?: boolean;
  setValidationError?: (error: string | null) => void;
  setIsValidating?: (validating: boolean) => void;
}

const FileUploadSection = ({ 
  selectedFile, 
  onFileChange, 
  validationError, 
  isValidating,
  setValidationError,
  setIsValidating 
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

      if (file.size > 10 * 1024 * 1024) {
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

  const isFileReady = selectedFile && !isValidating && !validationError && isOnline;

  return (
    <div className="space-y-4">
      <NetworkStatusIndicator />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Upload Image or Video
        </label>
        {!selectedFile ? (
          <FileInput isOnline={isOnline} onFileChange={handleFileChange} />
        ) : (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <FileStatusDisplay
                file={selectedFile}
                validationError={validationError}
                isValidating={isValidating}
                isOnline={isOnline}
              />
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
            
            {previewUrl && (
              <FilePreview
                file={selectedFile}
                previewUrl={previewUrl}
                validationError={validationError}
                isValidating={isValidating}
              />
            )}
          </div>
        )}
      </div>

      {/* Status messages */}
      {isFileReady && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">
              File ready! Continue to upload.
            </span>
          </div>
        </div>
      )}
      
      {validationError && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              Please select a different file.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
