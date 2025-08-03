import * as React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload } from 'lucide-react';

interface UploadButtonProps {
  onUpload: (file: File) => Promise<boolean>;
  acceptedFileTypes?: string;
  maxFileSize?: number; // in bytes
}

export const UploadButton: React.FC<UploadButtonProps> = ({ 
  onUpload, 
  acceptedFileTypes = 'image/*,video/*', 
  maxFileSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const isOnline = useNetworkStatus();
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxFileSize) {
        setErrorMessage(`File size exceeds the limit of ${maxFileSize / (1024 * 1024)}MB`);
        return;
      }

      setIsUploading(true);
      setUploadStatus('idle');
      setErrorMessage(null);

      try {
        const success = await onUpload(file);
        setUploadStatus(success ? 'success' : 'error');
        if (!success) {
          setErrorMessage('Upload failed. Please try again.');
        }
      } catch (error) {
        setUploadStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="upload-input"
        disabled={!isOnline || isUploading}
        accept={acceptedFileTypes}
      />
      <label htmlFor="upload-input">
        <Button disabled={!isOnline || isUploading} variant="outline">
          {isUploading ? (
            <Upload className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isOnline
            ? isUploading
              ? 'Uploading...'
              : 'Upload File'
            : 'Offline - Cannot Upload'}
        </Button>
      </label>
      {errorMessage && (
        <div className="text-red-500 flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          {errorMessage}
        </div>
      )}
      {uploadStatus === 'success' && (
        <div className="text-green-500">Upload successful!</div>
      )}
    </div>
  );
};

export default UploadButton;