import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface UploadButtonProps {
  onUpload: (file: File) => void;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ onUpload }) => {
  const isOnline = useNetworkStatus();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="upload-input"
        disabled={!isOnline}
      />
      <label htmlFor="upload-input">
        <Button disabled={!isOnline} variant="outline">
          {isOnline ? 'Upload File' : 'Offline - Cannot Upload'}
        </Button>
      </label>
      {!isOnline && (
        <div className="flex items-center text-yellow-500">
          <AlertCircle className="mr-2" size={16} />
          <p className="text-sm">You are currently offline. Please check your internet connection.</p>
        </div>
      )}
    </div>
  );
};