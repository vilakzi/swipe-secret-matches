
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

  // Enhanced mobile upload with better error handling
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Missing requirements",
        description: "Please select a file and ensure you're logged in.",
        variant: "destructive"
      });
      return;
    }

    // Enhanced network check for mobile
    if (!navigator.onLine) {
      toast({
        title: "No internet connection",
        description: "Please check your mobile data or WiFi connection",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(5);

    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.${fileExt}`;

      console.log(`Starting upload: ${fileName}, size: ${selectedFile.size} bytes`);

      // Mobile-specific file size check
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit for mobile
        toast({
          title: "File too large for mobile",
          description: "Please select a file smaller than 50MB",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      // Progress simulation for user feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 1000);

      // Upload with mobile-optimized settings
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half' // Better for mobile connections
        });

      clearInterval(progressInterval);
      setUploadProgress(90);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        let errorMessage = "Upload failed";
        if (uploadError.message?.includes('duplicate')) {
          errorMessage = "File already exists, please try again";
        } else if (uploadError.message?.includes('size')) {
          errorMessage = "File too large for your connection";
        } else if (uploadError.message?.includes('network') || uploadError.message?.includes('fetch')) {
          errorMessage = "Network error - check your connection and try again";
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
          title: "URL generation failed",
          description: "Could not generate URL for uploaded file",
          variant: "destructive"
        });
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(95);

      const expiresAt = calculateExpiryTime(promotionType);
      const postType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      console.log('Creating post record:', {
        provider_id: user.id,
        content_url: publicUrl,
        post_type: postType,
        promotion_type: promotionType
      });

      // Insert post with better error handling
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
        console.error('Database error:', postError);
        toast({
          title: "Database error",
          description: "File uploaded but failed to save post. Please contact support.",
          variant: "destructive"
        });
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(100);
      console.log('Post created successfully:', postData);

      // Success - show the new post
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
      if (!navigator.onLine) {
        errorMessage = "Lost internet connection during upload";
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Network error - please check your connection";
      } else if (error.message?.includes('timeout')) {
        errorMessage = "Upload timed out - file may be too large";
      }

      toast({
        title: errorMessage,
        description: "Please try again with a smaller file or better connection",
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
      />
    </Card>
  );
};

export default PostUploadForm;
