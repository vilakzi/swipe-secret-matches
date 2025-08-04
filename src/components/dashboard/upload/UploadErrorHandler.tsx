
import * as React from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface UploadErrorHandlerProps {
  error: string | null;
  isOnline: boolean;
}

const UploadErrorHandler: React.FC<UploadErrorHandlerProps> = ({ error, isOnline }) => {
  if (!error && isOnline) return null;

  return (
    <div className="space-y-3">
      {!isOnline && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              No internet connection - uploads are disabled
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              Upload Error: {error}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadErrorHandler;
