
import React from 'react';
import { Image, Video, CheckCircle, AlertTriangle } from 'lucide-react';

interface FileStatusDisplayProps {
  file: File;
  validationError: string | null;
  isValidating: boolean;
  isOnline: boolean;
}

const FileStatusDisplay = ({ file, validationError, isValidating, isOnline }: FileStatusDisplayProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFileReady = file && !isValidating && !validationError && isOnline;

  return (
    <div className="flex items-center space-x-3 flex-1">
      <div className="flex-shrink-0">
        {file.type.startsWith('image/') ? (
          <Image className="w-8 h-8 text-green-400" />
        ) : (
          <Video className="w-8 h-8 text-green-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{file.name}</p>
        <p className="text-gray-400 text-sm">
          {formatFileSize(file.size)} • {file.type.startsWith('image/') ? 'Image' : 'Video'}
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
  );
};

export default FileStatusDisplay;
