
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

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

  return (
    <Button
      onClick={onUpload}
      disabled={!selectedFile || uploading}
      className="w-full bg-purple-600 hover:bg-purple-700"
    >
      {uploading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Uploading...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Post - {getPromotionPrice(promotionType)}</span>
        </div>
      )}
    </Button>
  );
};

export default UploadButton;
