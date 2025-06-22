
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

  const resetForm = () => {
    setSelectedFile(null);
    setCaption('');
    setPromotionType('free_2h');
    setPreviewUrl(null);
    setNewPost(null);
    setStep(1);
    setUploadProgress(0);
  };

  // Step 1: Select file
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setCaption('');
    setPromotionType('free_2h');
    setNewPost(null);
    setUploadProgress(0);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setStep(2);
    } else {
      setPreviewUrl(null);
      setStep(1);
    }
  };

  // Step 2: Preview & details, then upload with mobile optimizations
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "No file or user",
        description: "Please select a file and try again.",
        variant: "destructive"
      });
      return;
    }

    // Check network connection
    if (!navigator.onLine) {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Show progress for large files
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Uploading large file...",
          description: "This may take a moment on mobile",
        });
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 500);

      // Upload file to Supabase Storage with retry logic
      let uploadData, uploadError;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const result = await supabase.storage
            .from('posts')
            .upload(fileName, selectedFile, {
              cacheControl: '3600',
              upsert: false
            });
          
          uploadData = result.data;
          uploadError = result.error;
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            uploadError = error;
          } else {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            toast({
              title: "Retrying upload...",
              description: `Attempt ${retryCount + 1} of ${maxRetries}`,
            });
          }
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        let errorMessage = "Upload failed";
        if (uploadError.message?.includes('network')) {
          errorMessage = "Network error - please check your connection";
        } else if (uploadError.message?.includes('timeout')) {
          errorMessage = "Upload timeout - file may be too large for your connection";
        } else if (uploadError.message?.includes('storage')) {
          errorMessage = "Storage error - please try again";
        }

        toast({
          title: errorMessage,
          description: uploadError.message,
          variant: "destructive"
        });
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        toast({
          title: "Get public URL failed",
          description: "Could not get URL for uploaded file.",
          variant: "destructive"
        });
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      const expiresAt = calculateExpiryTime(promotionType);
      const postType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      // Insert post record to DB with retry logic
      const { data: postData, error: postError } = await supabase
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

      if (postError) {
        toast({
          title: "Database error",
          description: "Post uploaded but failed to save to database. Please contact support.",
          variant: "destructive"
        });
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      // Step 3: Show post in feed immediately (optimistic update)
      setNewPost(postData);
      onAddPostToFeed(postData);
      setStep(3);

      if (promotionType !== 'free_2h') {
        onShowPayment(postData);
        toast({
          title: "Post uploaded successfully!",
          description: "Complete payment to activate promotion.",
        });
      } else {
        toast({
          title: "Post uploaded successfully!",
          description: "Your post is now live for 2 hours.",
        });
        onUploadSuccess();
      }

      setSelectedFile(null);
      setCaption('');
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      let errorMessage = "Upload failed";
      
      if (error.message?.includes('network') || !navigator.onLine) {
        errorMessage = "Network error - please check your connection";
      } else if (error.message?.includes('size')) {
        errorMessage = "File too large for your connection";
      }

      toast({
        title: errorMessage,
        description: error.message ?? String(error),
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
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
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
          />
          <button
            type="button"
            className="text-gray-400 underline ml-4"
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
      />
    </Card>
  );
};

export default PostUploadForm;
