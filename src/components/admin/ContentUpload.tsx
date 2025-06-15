import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useContentUpload } from "./useContentUpload";
import ContentFileDropzone from "./ContentFileDropzone";
import ContentFilePreviewList from "./ContentFilePreviewList";
import ContentBulkActions from "./ContentBulkActions";

/** Info block for consistency with EnhancedContent */
const ClassicContentFeatureInfo = () => (
  <div
    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4"
    role="region"
    aria-label="Content Upload Auto Features"
  >
    <h4 className="font-medium text-blue-900 mb-2">
      Content Upload Features
    </h4>
    <ul className="text-sm text-blue-700 space-y-1">
      <li>• Creates content profile cards automatically</li>
      <li>• Official verification badge</li>
      <li>• Content type indicators (image/video)</li>
      <li>• Engagement metrics tracking</li>
      <li>• Automatic timestamp & sorting</li>
      <li>• Accessible upload workflow</li>
    </ul>
    <div className="mt-3 text-xs text-blue-700">
      <span aria-live="polite">
        For support, contact admin@yourapp.com.
      </span>
    </div>
  </div>
);

const ContentUpload = () => {
  const {
    uploadFiles,
    uploading,
    onDrop,
    removeFile,
    handleBulkUpload,
  } = useContentUpload();

  // Modern dropzone props (like Enhanced)
  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Content Upload & Profile Card Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload content to automatically generate "Content" profile cards in the feed.
        </p>
        <div className="mt-2">
          <span className="text-xs text-blue-600" id="classic-upload-helper-tip">
            <strong>Tip:</strong> Fill up with multiple images or videos, then upload all at once.
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ContentFileDropzone
          onDrop={onDrop}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
        />
        <div className="text-xs text-gray-500 ml-1" id="dropzone-info-block">
          Drag & drop files or click to add. All content is instantly profiled.
        </div>
        <ContentBulkActions
          uploadFiles={uploadFiles}
          uploading={uploading}
          handleBulkUpload={handleBulkUpload}
        />
        <ContentFilePreviewList uploadFiles={uploadFiles} onRemove={removeFile} />
        <ClassicContentFeatureInfo />
      </CardContent>
    </Card>
  );
};

export default ContentUpload;
