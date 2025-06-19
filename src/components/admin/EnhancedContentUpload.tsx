import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import EnhancedContentUploadForm from "./EnhancedContentUploadForm";
import EnhancedContentFileDropzone from "./EnhancedContentFileDropzone";
import EnhancedContentBulkActions from "./EnhancedContentBulkActions";
import EnhancedContentFileList from "./EnhancedContentFileList";
import EnhancedContentFeatureInfo from "./EnhancedContentFeatureInfo";
import { useEnhancedContentUpload } from "./useEnhancedContentUpload";
import { ContentCategory } from "@/hooks/useEnhancedAdminContent";

const CONTENT_CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'news', label: 'News' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'food', label: 'Food' },
  { value: 'travel', label: 'Travel' },
  { value: 'education', label: 'Education' },
  { value: 'business', label: 'Business' },
  { value: 'health', label: 'Health' },
  { value: 'other', label: 'Other' },
];

const EnhancedContentUpload = () => {
  const {
    uploadFiles,
    uploading,
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    tags,
    setTags,
    scheduledDate,
    setScheduledDate,
    onDrop,
    removeFile,
    handleBulkUpload,
    role,
    maxSize,
  } = useEnhancedContentUpload();

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
    maxSize
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Enhanced Content Upload & Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload content with categories, tags, and automatic approval workflow.
        </p>
        <div className="mt-2">
          <span className="text-xs text-blue-600">
            <strong>Tip:</strong> All files will be checked for duplicates and require admin approval.{" "}
            <span aria-live="polite">Scheduled posts will appear at the scheduled time.</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnhancedContentUploadForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          tags={tags}
          setTags={setTags}
          scheduledDate={scheduledDate}
          setScheduledDate={setScheduledDate}
          CONTENT_CATEGORIES={CONTENT_CATEGORIES}
        />
        <div className="text-xs text-gray-500 mb-2 pl-1" role="note" id="upload-helper-tip">
          Please fill in details for better search and categorization. Tags are comma-separated. Scheduling is optional.
        </div>
        <EnhancedContentFileDropzone
          onDrop={onDrop}
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          maxSize={maxSize}
          role={role}
        />
        <div className="text-xs text-gray-500 ml-1" id="dropzone-helper-tip">
          Drag & drop files or click to add files. Only approved types and size.
        </div>
        <EnhancedContentBulkActions
          uploadFiles={uploadFiles}
          uploading={uploading}
          handleBulkUpload={handleBulkUpload}
        />
        <EnhancedContentFileList uploadFiles={uploadFiles} onRemove={removeFile} />
        <EnhancedContentFeatureInfo />
      </CardContent>
    </Card>
  );
};

export default EnhancedContentUpload;
