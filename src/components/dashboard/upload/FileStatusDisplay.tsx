
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Image, Video, CheckCircle, AlertTriangle, X } from 'lucide-react';
import FilePreview from './FilePreview';

interface FileStatusDisplayProps {
  file: File;
  validationError: string | null;
  isValidating: boolean;
  isOnline: boolean;
  previewUrl: string | null;
  onRemove: () => void;
}

const FileStatusDisplay = ({ 
  file, 
  validationError, 
  isValidating, 
  isOnline, 
  previewUrl,
  onRemove 
}: FileStatusDisplayProps) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isFileReady = file && !isValidating && !validationError && isOnline;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <div className="flex items-start justify-between">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
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
          file={file}
          previewUrl={previewUrl}
          validationError={validationError}
          isValidating={isValidating}
        />
      )}
    </div>
  );
};

export default FileStatusDisplay;
