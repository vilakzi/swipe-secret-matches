
import React from 'react';
import UploadButton from './UploadButton';

interface PostFormActionsProps {
  selectedFile: File | null;
  uploading: boolean;
  promotionType: string;
  validationError: string | null;
  isValidating: boolean;
  onUpload: () => void;
  onCancel: () => void;
}

const PostFormActions = ({
  selectedFile,
  uploading,
  promotionType,
  validationError,
  isValidating,
  onUpload,
  onCancel
}: PostFormActionsProps) => {
  return (
    <div className="flex space-x-2 mt-4">
      <UploadButton
        selectedFile={selectedFile}
        uploading={uploading}
        promotionType={promotionType}
        onUpload={onUpload}
        validationError={validationError}
        isValidating={isValidating}
      />
      <button
        type="button"
        className="text-gray-400 underline ml-4 disabled:opacity-50"
        onClick={onCancel}
        disabled={uploading}
      >
        Cancel
      </button>
    </div>
  );
};

export default PostFormActions;
