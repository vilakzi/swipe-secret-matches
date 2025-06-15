import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image, Video, AlertTriangle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useEnhancedAdminContent, ContentCategory } from '@/hooks/useEnhancedAdminContent';
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";
import EnhancedContentUploadForm from "./EnhancedContentUploadForm";
import EnhancedContentFileDropzone from "./EnhancedContentFileDropzone";
import EnhancedContentFilePreview from "./EnhancedContentFilePreview";
import EnhancedContentBulkActions from "./EnhancedContentBulkActions";
import EnhancedContentFileList from "./EnhancedContentFileList";
import EnhancedContentFeatureInfo from "./EnhancedContentFeatureInfo";

interface UploadFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  id: string;
  hash?: string;
  isDuplicate?: boolean;
}

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
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ContentCategory>('other');
  const [tags, setTags] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState('');
  const { createContent } = useEnhancedAdminContent();
  const { role } = useUserRole();
  const maxSize = getMaxUploadSize(role);

  // Generate file hash for duplicate detection
  const generateFileHash = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = [];
    
    for (const file of acceptedFiles) {
      if (file.size > maxSize) {
        alert(`"${file.name}" too large: ${Math.round(file.size / (1024*1024))}MB. Limit: ${Math.round(maxSize / (1024*1024))}MB (${role})`);
        continue;
      }
      const hash = await generateFileHash(file);
      
      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
        id: Math.random().toString(36).substr(2, 9),
        hash,
        isDuplicate: false // We'll check this against the database during upload
      });
    }
    
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [maxSize, role, generateFileHash]);

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

  const processAndOptimizeFile = async (uploadFile: UploadFile) => {
    // In a real implementation, this would resize/optimize the file
    // For now, we'll simulate the process and return the original file data
    const optimizedSizes = {
      thumbnail: { width: 150, height: 150, size: Math.round(uploadFile.file.size * 0.1) },
      small: { width: 400, height: 400, size: Math.round(uploadFile.file.size * 0.3) },
      medium: { width: 800, height: 600, size: Math.round(uploadFile.file.size * 0.6) },
      large: { width: 1200, height: 900, size: Math.round(uploadFile.file.size * 0.8) }
    };

    return {
      fileUrl: uploadFile.preview, // In real app, upload to Supabase Storage
      thumbnailUrl: uploadFile.preview,
      optimizedSizes
    };
  };

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    const { fileUrl, thumbnailUrl, optimizedSizes } = await processAndOptimizeFile(uploadFile);
    
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    
    await createContent({
      title: title || uploadFile.file.name,
      description,
      content_type: uploadFile.type,
      file_url: fileUrl,
      thumbnail_url: uploadFile.type === 'image' ? thumbnailUrl : undefined,
      file_size: uploadFile.file.size,
      original_file_size: uploadFile.file.size,
      optimized_file_sizes: optimizedSizes,
      content_hash: uploadFile.hash,
      category,
      status: scheduledDate ? 'scheduled' : 'draft',
      scheduled_at: scheduledDate || undefined,
      visibility: 'public',
      auto_published: false,
      metadata: {
        originalName: uploadFile.file.name,
        uploadedAt: new Date().toISOString(),
        requiresApproval: true,
      },
      tags: tagsArray,
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
      setTitle('');
      setDescription('');
      setTags('');
      setScheduledDate('');
      setCategory('other');
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
        {/* Content Details Form */}
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
        {/* Drag & Drop Area */}
        <EnhancedContentFileDropzone
          onDrop={onDrop}
          isDragActive={isDragActive}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          role={role}
          maxSize={maxSize}
        />
        <div className="text-xs text-gray-500 ml-1" id="dropzone-helper-tip">
          Drag & drop files or click to add files. Only approved types and size.
        </div>
        {/* Bulk Actions (Upload All button/bar) */}
        <EnhancedContentBulkActions
          uploadFiles={uploadFiles}
          uploading={uploading}
          handleBulkUpload={handleBulkUpload}
        />
        {/* File Previews List */}
        <EnhancedContentFileList uploadFiles={uploadFiles} onRemove={removeFile} />
        {/* Features Info/Panel */}
        <EnhancedContentFeatureInfo />
      </CardContent>
    </Card>
  );
};

export default EnhancedContentUpload;
