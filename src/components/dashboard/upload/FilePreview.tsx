
import React from 'react';

interface FilePreviewProps {
  file: File;
  previewUrl: string;
  validationError: string | null;
  isValidating: boolean;
}

const FilePreview = ({ file, previewUrl, validationError, isValidating }: FilePreviewProps) => {
  if (validationError || isValidating) return null;

  return (
    <div className="mt-3 rounded-lg overflow-hidden">
      {file.type.startsWith('image/') && (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-32 object-cover object-center rounded"
          style={{ aspectRatio: '16/9' }}
          loading="lazy"
        />
      )}
      {file.type.startsWith('video/') && (
        <video
          src={previewUrl}
          className="w-full h-32 object-cover object-center rounded"
          style={{ aspectRatio: '16/9' }}
          controls
          preload="metadata"
          playsInline
          muted
        />
      )}
    </div>
  );
};

export default FilePreview;
