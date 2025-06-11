
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image, Video } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAdminContent } from '@/hooks/useAdminContent';

interface UploadFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  id: string;
}

const ContentUpload = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { createContent } = useAdminContent();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
      id: Math.random().toString(36).substr(2, 9),
    }));
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setUploadFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    // Simulate file upload - replace with actual storage logic
    const fileUrl = uploadFile.preview; // In real app, upload to Supabase Storage
    
    await createContent({
      title: uploadFile.file.name,
      content_type: uploadFile.type,
      file_url: fileUrl,
      thumbnail_url: uploadFile.type === 'image' ? fileUrl : undefined,
      file_size: uploadFile.file.size,
      status: 'draft',
      visibility: 'public',
      metadata: {
        originalName: uploadFile.file.name,
        uploadedAt: new Date().toISOString(),
      },
    });
  };

  const handleBulkUpload = async () => {
    setUploading(true);
    try {
      for (const uploadFile of uploadFiles) {
        await uploadSingleFile(uploadFile);
      }
      
      // Clean up
      uploadFiles.forEach(file => URL.revokeObjectURL(file.preview));
      setUploadFiles([]);
    } catch (error) {
      console.error('Bulk upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Content Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-purple-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports images and videos (unlimited uploads)
              </p>
            </div>
          )}
        </div>

        {/* File Previews */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="relative group">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {uploadFile.type === 'image' ? (
                      <img
                        src={uploadFile.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={uploadFile.preview}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                  
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeFile(uploadFile.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      {uploadFile.type === 'image' ? (
                        <Image className="w-3 h-3" />
                      ) : (
                        <Video className="w-3 h-3" />
                      )}
                      {uploadFile.type}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentUpload;
