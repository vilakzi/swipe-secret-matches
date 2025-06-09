
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle } from 'lucide-react';

interface UploadButtonProps {
  selectedFile: File | null;
  uploading: boolean;
  promotionType: string;
  onUpload: () => void;
}

const UploadButton = ({ selectedFile, uploading, promotionType, onUpload }: UploadButtonProps) => {
  const getPromotionPrice = (type: string) => {
    switch (type) {
      case 'paid_8h':
        return 'R20';
      case 'paid_12h':
        return 'R39';
      default:
        return 'Free';
    }
  };

  const isReady = selectedFile && !uploading;
  const isDisabled = !selectedFile || uploading;

  return (
    <div className="space-y-3">
      {selectedFile && !uploading && (
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              Ready to upload: {selectedFile.name}
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
        {uploading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Uploading...</span>
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
      
      {!selectedFile && (
        <p className="text-center text-gray-400 text-xs">
          Please select an image or video file first
        </p>
      )}
    </div>
  );
};

export default UploadButton;
