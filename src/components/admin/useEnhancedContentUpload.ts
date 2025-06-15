
import { useState, useCallback } from "react";
import { useEnhancedAdminContent, ContentCategory } from "@/hooks/useEnhancedAdminContent";
import { useUserRole } from "@/hooks/useUserRole";
import { getMaxUploadSize } from "@/utils/getMaxUploadSize";

export interface UploadFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
  id: string;
  hash?: string;
  isDuplicate?: boolean;
}

export function useEnhancedContentUpload() {
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
        alert(
          `"${file.name}" too large: ${Math.round(file.size / (1024 * 1024))}MB. Limit: ${Math.round(
            maxSize / (1024 * 1024)
          )}MB (${role})`
        );
        continue;
      }
      const hash = await generateFileHash(file);

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'video',
        id: Math.random().toString(36).substr(2, 9),
        hash,
        isDuplicate: false,
      });
    }
    setUploadFiles(prev => [...prev, ...newFiles]);
  }, [maxSize, role]);

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
    // Simulate optimization
    const optimizedSizes = {
      thumbnail: { width: 150, height: 150, size: Math.round(uploadFile.file.size * 0.1) },
      small: { width: 400, height: 400, size: Math.round(uploadFile.file.size * 0.3) },
      medium: { width: 800, height: 600, size: Math.round(uploadFile.file.size * 0.6) },
      large: { width: 1200, height: 900, size: Math.round(uploadFile.file.size * 0.8) }
    };

    return {
      fileUrl: uploadFile.preview,
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

  return {
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
  };
}
