
import React from 'react';

interface PostPreviewProps {
  file: File;
  previewUrl: string | null;
}

const PostPreview = ({ file, previewUrl }: PostPreviewProps) => {
  if (!previewUrl) return null;

  return (
    <div className="mb-4">
      {file.type.startsWith('image/') && (
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full max-h-64 object-contain rounded mb-2"
          style={{ aspectRatio: '16/9' }}
          loading="lazy"
        />
      )}
      {file.type.startsWith('video/') && (
        <video
          src={previewUrl}
          controls
          className="w-full max-h-64 object-contain rounded mb-2"
          style={{ aspectRatio: '16/9' }}
          preload="metadata"
          playsInline
          muted
        />
      )}
    </div>
  );
};

export default PostPreview;
