
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FileUploadSection from './upload/FileUploadSection';
import CaptionSection from './upload/CaptionSection';
import PromotionTypeSelector from './upload/PromotionTypeSelector';
import UploadButton from './upload/UploadButton';
import PostCard from './PostCard';

interface PostUploadFormProps {
  onUploadSuccess: () => void;
  onShowPayment: (post: any) => void;
  onAddPostToFeed: (post: any) => void;
}

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';
type Step = 1 | 2 | 3;

const PostUploadForm = ({ onUploadSuccess, onShowPayment, onAddPostToFeed }: PostUploadFormProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [promotionType, setPromotionType] = useState<PromotionType>('free_2h');
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newPost, setNewPost] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setCaption('');
    setPromotionType('free_2h');
    setPreviewUrl(null);
    setNewPost(null);
    setStep(1);
    setUploadProgress(0);
    setValidationError(null);
    setIsValidating(false);
  };

  // Enhanced retry logic for mobile connections
  const retryOperation = async (operation: () => Promise<any>, maxRetries = 3): Promise<any> => {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error);
        
        // Don't retry on authentication or permission errors
        if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
          throw error;
        }
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter for mobile connections
          const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 1000, 10000);
          console.log(`Waiting ${delay}ms before retry ${attempt + 1}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };

  // Step 1: Select file
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setCaption('');
    setPromotionType('free_2h');
    setNewPost(null);
    setUploadProgress(0);
    setValidationError(null);
    setIsValidating(false);
    
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setStep(2);
    } else {
      setPreviewUrl(null);
      setStep(1);
    }
  };

  // Enhanced upload with comprehensive error handling
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Missing requirements",
        description: "Please select a file and ensure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    // Pre-flight checks
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

      // Mobile file size check (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB for mobile uploads",
          variant: "destructive"
        });
        return;
      }

      // Progress tracking
      setUploadProgress(10);

      // Upload with retry logic and mobile-optimized settings
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

      // Get public URL with retry
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

      // Insert post with retry logic
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

      // Success handling
      setNewPost(postData);
      onAddPostToFeed(postData);
      setStep(3);

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
        onUploadSuccess();
      }

      // Clear form
      setSelectedFile(null);
      setCaption('');
      setPreviewUrl(null);
      
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

  // Step 3: Show the new post
  if (step === 3 && newPost) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Your Post is Live!</h2>
        <PostCard post={newPost} />
        <button
          className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          onClick={resetForm}
        >
          Post another
        </button>
      </Card>
    );
  }

  // Step 2: Preview & details
  if (step === 2 && selectedFile) {
    return (
      <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Preview Your Post</h2>
        
        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="mb-4 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm">Uploading...</span>
              <span className="text-white text-sm">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {uploadProgress < 30 ? 'Preparing upload...' : 
               uploadProgress < 70 ? 'Uploading file...' : 
               uploadProgress < 95 ? 'Processing...' : 'Almost done...'}
            </div>
          </div>
        )}

        <div className="mb-4">
          {selectedFile.type.startsWith('image/') && previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain rounded mb-2"
              style={{ aspectRatio: '16/9' }}
              loading="lazy"
            />
          )}
          {selectedFile.type.startsWith('video/') && previewUrl && (
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
        
        <CaptionSection
          caption={caption}
          onCaptionChange={setCaption}
        />
        <PromotionTypeSelector
          promotionType={promotionType}
          onPromotionTypeChange={setPromotionType}
        />
        
        <div className="flex space-x-2 mt-4">
          <UploadButton
            selectedFile={selectedFile}
            uploading={uploading}
            promotionType={promotionType}
            onUpload={handleUpload}
            validationError={validationError}
            isValidating={isValidating}
          />
          <button
            type="button"
            className="text-gray-400 underline ml-4 disabled:opacity-50"
            onClick={resetForm}
            disabled={uploading}
          >
            Cancel
          </button>
        </div>
      </Card>
    );
  }

  // Step 1: Select file
  return (
    <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Create New Post</h2>
      <FileUploadSection
        selectedFile={selectedFile}
        onFileChange={handleFileChange}
        validationError={validationError}
        isValidating={isValidating}
        setValidationError={setValidationError}
        setIsValidating={setIsValidating}
      />
    </Card>
  );
};

export default PostUploadForm;
