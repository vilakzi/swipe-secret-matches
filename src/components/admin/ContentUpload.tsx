import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, Video } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAdminContent } from '@/hooks/useAdminContent';
import { useContentUpload } from "./useContentUpload";
import ContentFileDropzone from "./ContentFileDropzone";
import ContentFilePreviewList from "./ContentFilePreviewList";

interface UploadFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  id: string;
}

const ContentUpload = () => {
  const {
    uploadFiles,
    uploading,
    onDrop,
    removeFile,
    handleBulkUpload,
  } = useContentUpload();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Content Upload & Profile Card Generator
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload content to automatically generate "Content" profile cards in the feed
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <ContentFileDropzone onDrop={onDrop} />
        {uploadFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Files Ready for Upload ({uploadFiles.length})
              </h3>
              <Button 
                onClick={handleBulkUpload} 
                disabled={uploading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </div>
            <ContentFilePreviewList uploadFiles={uploadFiles} onRemove={removeFile} />
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Automatic Profile Card Generation</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• All uploaded content creates "Content" profile cards</li>
            <li>• Cards include official verification badge</li>
            <li>• Content type indicators (image/video)</li>
            <li>• Engagement metrics tracking</li>
            <li>• Automatic timestamp and sorting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentUpload;
