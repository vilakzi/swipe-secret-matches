
import React from 'react';

interface UploadProgressProps {
  uploadProgress: number;
  uploading: boolean;
}

const UploadProgress = ({ uploadProgress, uploading }: UploadProgressProps) => {
  if (!uploading || uploadProgress === 0) return null;

  const getProgressMessage = (progress: number) => {
    if (progress < 30) return 'Preparing upload...';
    if (progress < 70) return 'Uploading file...';
    if (progress < 95) return 'Processing...';
    return 'Almost done...';
  };

  return (
    <div className="mb-4 bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm">Uploading...</span>
        <span className="text-white text-sm">{Math.round(uploadProgress)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <div className="text-gray-400 text-xs mt-1">
        {getProgressMessage(uploadProgress)}
      </div>
    </div>
  );
};

export default UploadProgress;
