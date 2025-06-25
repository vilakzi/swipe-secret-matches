
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateFileName, getFileExtension, validateFileSize } from './uploadUtils';
import { uploadFileToStorage } from './fileUploadService';
import { createPostRecord } from './postCreationService';
import { handleUploadError, checkNetworkConnection } from './uploadErrorHandler';

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';

export const usePostUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadPost = async (
    selectedFile: File,
    caption: string,
    promotionType: PromotionType,
    validationError: string | null,
    onSuccess: () => void,
    onAddToFeed: (post: any) => void,
    onShowPayment: (post: any) => void
  ) => {
    if (!selectedFile || !user) {
      toast({
        title: "Missing requirements",
        description: "Please select a file and ensure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    if (!checkNetworkConnection()) {
      return;
    }

    if (validationError) {
      toast({
        title: "File validation failed",
        description: "Please select a different file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = getFileExtension(selectedFile.name);
      if (!fileExt) {
        throw new Error('Invalid file extension');
      }

      validateFileSize(selectedFile);
      
      const fileName = generateFileName(user.id, fileExt);

      // Upload file to storage
      const publicUrl = await uploadFileToStorage(fileName, selectedFile, setUploadProgress);

      // Create post record in database
      const postData = await createPostRecord(
        user.id,
        publicUrl,
        selectedFile.type,
        caption,
        promotionType,
        setUploadProgress
      );

      onAddToFeed(postData);

      if (promotionType !== 'free_2h') {
        onShowPayment(postData);
        toast({
          title: "Upload successful!",
          description: "Complete payment to activate promotion.",
        });
      } else {
        toast({
          title: "Upload successful!",
          description: "Your post is now live for 2 hours.",
        });
        onSuccess();
      }

      return postData;
      
    } catch (error: any) {
      handleUploadError(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadPost
  };
};
