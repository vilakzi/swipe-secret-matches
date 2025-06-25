
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Upload } from 'lucide-react';

interface MobileUploadProgressProps {
  progress: number;
  isUploading: boolean;
  error: string | null;
  fileName?: string;
}

const MobileUploadProgress: React.FC<MobileUploadProgressProps> = ({
  progress,
  isUploading,
  error,
  fileName
}) => {
  if (!isUploading && !error && progress === 0) {
    return null;
  }

  return (
    <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            {isUploading ? 'Uploading...' : error ? 'Upload Failed' : 'Upload Complete'}
          </span>
          <span className="text-sm text-gray-400">
            {progress}%
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-2"
        />
      </div>

      {/* File Info */}
      {fileName && (
        <div className="flex items-center space-x-2">
          {error ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : progress === 100 ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Upload className="w-4 h-4 text-blue-400" />
          )}
          <span className="text-sm text-gray-300 truncate">{fileName}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-600/30">
          {error}
        </div>
      )}

      {/* Mobile-specific tips */}
      {isUploading && (
        <div className="text-xs text-gray-500">
          💡 Keep app open and screen on for best upload performance
        </div>
      )}
    </div>
  );
};

export default MobileUploadProgress;
