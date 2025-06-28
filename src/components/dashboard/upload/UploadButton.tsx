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
  uploadError?: string | null;
}

function UploadButton({ 
  selectedFile, 
  uploading, 
  promotionType, 
  onUpload,
  validationError,
  isValidating,
  uploadError
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

  const hasError = validationError || uploadError;
  const isReady = selectedFile && !uploading && !hasError && !isValidating && isOnline;
  const isDisabled = !selectedFile || uploading || !!hasError || isValidating || !isOnline;

  return (
    <div className="space-y-3">
      {/* Network Status Warning */}
      {!isOnline && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              No internet connection - Check your mobile data or WiFi
            </span>
          </div>
        </div>
      )}

      {/* File Ready Status */}
      {isReady && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Ready to upload: {selectedFile.name}
            </span>
          </div>
          {selectedFile.size > 10 * 1024 * 1024 && (
            <div className="mt-2 text-yellow-400 text-xs">
              Large file - may take longer on mobile connection
            </div>
          )}
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              Upload failed: {uploadError}
            </span>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && !uploadError && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              File validation failed: {validationError}
            </span>
          </div>
        </div>
      )}

      {/* Validating Status */}
      {isValidating && (
        <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-yellow-400 text-sm font-medium">
              Validating file...
            </span>
          </div>
        </div>
      )}
      
      {/* Main Upload Button */}
      <Button
        onClick={onUpload}
        disabled={isDisabled}
        className={`w-full h-12 transition-all duration-200 text-base font-medium ${
          isReady 
            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/25 text-white border-0' 
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-not-allowed border-gray-600'
        }`}
      >
        {renderButtonContent()}
      </Button>
      
      {/* Status Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-gray-400 text-xs">
          Max: {Math.round(maxSize / (1024*1024))}MB • {role}
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
    </div>
  );

  function renderButtonContent() {
    if (!isOnline) {
      return (
        <div className="flex items-center space-x-2">
          <WifiOff className="w-5 h-5" />
          <span>No Connection</span>
        </div>
      );
    } else if (uploading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Uploading...</span>
        </div>
      );
    } else if (isValidating) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Validating...</span>
        </div>
      );
    } else if (hasError) {
      return (
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Error - Cannot Upload</span>
        </div>
      );
    } else if (selectedFile) {
      return (
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Post - {getPromotionPrice(promotionType)}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Select a file to upload</span>
        </div>
      );
    }
  }
}

export default UploadButton;