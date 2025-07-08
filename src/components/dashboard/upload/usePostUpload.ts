
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { generateFileName, getFileExtension, validateFileSize } from './uploadUtils';
import { uploadFileToStorage } from './fileUploadService';
import { createPostRecord } from './postCreationService';
import { handleUploadError, checkNetworkConnection, retryUploadWithFallback } from './uploadErrorHandler';

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';
type LocationOption = 'all' | 'soweto' | 'jhb-central' | 'pta';

export const usePostUpload = () => {
  const { user } = useEnhancedAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadPost = async (
    selectedFile: File,
    caption: string,
    promotionType: PromotionType,
    selectedLocations: LocationOption[],
    validationError: string | null,
    onSuccess: () => void,
    onAddToFeed: (post: any) => void,
    onShowPayment: (post: any) => void
  ) => {
    // Clear previous errors
    setUploadError(null);

    if (!selectedFile || !user) {
      const errorMsg = !user ? "Please log in to upload files" : "Please select a file to upload";
      setUploadError(errorMsg);
      toast({
        title: "Upload Failed",
        description: errorMsg,
        variant: "destructive"
      });
      return;
    }

    // Enhanced network check for mobile
    const connectionOk = await checkNetworkConnection();
    if (!connectionOk) {
      setUploadError("Connection check failed");
      return;
    }

    if (validationError) {
      setUploadError(validationError);
      toast({
        title: "File validation failed",
        description: validationError,
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

      // Upload file to Supabase Storage with retry mechanism
      const publicUrl = await retryUploadWithFallback(
        () => uploadFileToStorage(fileName, selectedFile, setUploadProgress),
        3
      );

      // Create post record in database
      const postData = await createPostRecord(
        user.id,
        publicUrl,
        selectedFile.type,
        caption,
        promotionType,
        selectedLocations,
        setUploadProgress
      );

      setUploadProgress(100);
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
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Upload failed. Please try again.';
      setUploadError(errorMessage);
      handleUploadError(error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploading,
    uploadProgress,
    uploadPost,
    uploadError
  };
};
