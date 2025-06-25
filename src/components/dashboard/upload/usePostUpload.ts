
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';

export const usePostUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const calculateExpiryTime = (type: string) => {
    const now = new Date();
    switch (type) {
      case 'free_2h':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
      case 'paid_8h':
        return new Date(now.getTime() + 8 * 60 * 60 * 1000);
      case 'paid_12h':
        return new Date(now.getTime() + 12 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    }
  };

  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3): Promise<any> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 10000);
          console.log(`Waiting ${delay}ms before retry ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };

  const uploadPost = async (
    selectedFile: File,
    caption: string,
    promotionType: PromotionType,
    validationError: string | null,
    onSuccess: (post: any) => void,
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

    if (!navigator.onLine) {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
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
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${user.id}/${timestamp}-${randomSuffix}.${fileExt}`;

      console.log(`Starting upload: ${fileName}, size: ${selectedFile.size} bytes`);

      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB for mobile uploads",
          variant: "destructive"
        });
        return;
      }

      setUploadProgress(10);

      const uploadData = await retryOperation(async () => {
        const { data, error } = await supabase.storage
          .from('posts')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: selectedFile.type,
          });

        if (error) {
          console.error('Storage upload error:', error);
          throw new Error(`Upload failed: ${error.message}`);
        }

        return data;
      });

      setUploadProgress(60);

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      setUploadProgress(80);

      const expiresAt = calculateExpiryTime(promotionType);
      const postType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      console.log('Creating post record:', {
        provider_id: user.id,
        content_url: publicUrl,
        post_type: postType,
        promotion_type: promotionType
      });

      const postData = await retryOperation(async () => {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            provider_id: user.id,
            content_url: publicUrl,
            post_type: postType,
            caption: caption.trim() || null,
            promotion_type: promotionType,
            expires_at: expiresAt.toISOString(),
            is_promoted: promotionType !== 'free_2h',
            payment_status: promotionType === 'free_2h' ? 'paid' : 'pending'
          })
          .select()
          .single();

        if (error) {
          console.error('Database insert error:', error);
          throw new Error(`Failed to save post: ${error.message}`);
        }

        return data;
      });

      setUploadProgress(100);
      console.log('Post created successfully:', postData);

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
      
      let errorMessage = "Upload failed";
      let errorDescription = "Please try again";

      if (!navigator.onLine) {
        errorMessage = "Connection lost";
        errorDescription = "Please check your internet connection";
      } else if (error.message?.includes('timeout') || error.message?.includes('fetch')) {
        errorMessage = "Network timeout";
        errorDescription = "Poor connection detected. Try with a smaller file or better signal";
      } else if (error.message?.includes('size') || error.message?.includes('large')) {
        errorMessage = "File too large";
        errorDescription = "Please compress your file or try a smaller one";
      } else if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
        errorMessage = "Permission denied";
        errorDescription = "Please log out and log back in";
      } else if (error.message?.includes('storage')) {
        errorMessage = "Storage error";
        errorDescription = "Server storage issue. Please try again in a moment";
      }

      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive"
      });
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
