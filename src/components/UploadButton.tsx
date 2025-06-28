import React from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

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
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="upload-input"
        disabled={!isOnline}
      />
      <label htmlFor="upload-input">
        <button disabled={!isOnline}>
          {isOnline ? 'Upload File' : 'Offline - Cannot Upload'}
        </button>
      </label>
      {!isOnline && <p>You are currently offline. Please check your internet connection.</p>}
    </div>
  );
};