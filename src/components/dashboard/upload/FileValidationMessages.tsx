
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FileValidationMessagesProps {
  isFileReady: boolean;
  validationError: string | null;
}

const FileValidationMessages = ({ isFileReady, validationError }: FileValidationMessagesProps) => {
  return (
    <>
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
    </>
  );
};

export default FileValidationMessages;
