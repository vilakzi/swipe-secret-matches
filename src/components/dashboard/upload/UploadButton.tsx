
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";

interface UploadButtonProps {
  selectedFile: File | null;
  uploading: boolean;
  promotionType: string;
  onUpload: () => void;
  validationError?: string | null;
  isValidating?: boolean;
}

function UploadButton({ 
  selectedFile, 
  uploading, 
  promotionType, 
  onUpload,
  validationError,
  isValidating 
}: UploadButtonProps) {
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);
  const isOnline = navigator.onLine;

  function getPromotionPrice(type: string) {
    switch (type) {
      case 'paid_8h':
        return 'R20';
      case 'paid_12h':
        return 'R39';
      default:
        return 'Free';
    }
  }

  const isReady = selectedFile && !uploading && !validationError && !isValidating && isOnline;
  const isDisabled = !selectedFile || uploading || !!validationError || isValidating || !isOnline;

  return (
    <div className="space-y-3">
      {/* Network Status Warning */}
      {!isOnline && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              No internet connection - Upload unavailable
            </span>
          </div>
        </div>
      )}

      {selectedFile && !uploading && !validationError && !isValidating && isOnline && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Ready to upload: {selectedFile.name}
            </span>
          </div>
          {selectedFile.size > 10 * 1024 * 1024 && (
            <div className="mt-2 text-yellow-400 text-xs">
              Large file detected - upload may take longer on mobile
            </div>
          )}
        </div>
      )}

      {validationError && (
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              File validation failed - cannot upload
            </span>
          </div>
        </div>
      )}

      {isValidating && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-yellow-400 text-sm font-medium">
              Validating file...
            </span>
          </div>
        </div>
      )}
      
      <Button
        onClick={onUpload}
        disabled={isDisabled}
        className={`w-full transition-all duration-200 ${
          isReady 
            ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 text-white' 
            : 'bg-gray-600 hover:bg-gray-700 text-gray-300 cursor-not-allowed'
        }`}
      >
        {!isOnline ? (
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span>No Connection</span>
          </div>
        ) : uploading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Uploading...</span>
          </div>
        ) : isValidating ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Validating...</span>
          </div>
        ) : validationError ? (
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>File Invalid - Cannot Upload</span>
          </div>
        ) : selectedFile ? (
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Submit & Upload Post - {getPromotionPrice(promotionType)}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Select a file to upload</span>
          </div>
        )}
      </Button>
      
      <div className="flex items-center justify-between">
        <p className="text-center text-gray-400 text-xs">
          Max file size: {Math.round(maxSize / (1024*1024))}MB ({role})
        </p>
        <div className="flex items-center space-x-1">
          {isOnline ? (
            <Wifi className="w-3 h-3 text-green-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-red-400" />
          )}
          <span className="text-xs text-gray-400">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      {!selectedFile && (
        <p className="text-center text-gray-400 text-xs">
          Please select an image or video file first
        </p>
      )}

      {validationError && (
        <p className="text-center text-red-400 text-xs">
          Please select a different file
        </p>
      )}

      {!isOnline && (
        <p className="text-center text-red-400 text-xs">
          Internet connection required for uploads
        </p>
      )}
    </div>
  );
}

export default UploadButton;
