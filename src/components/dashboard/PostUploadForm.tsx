import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import FileUploadSection from './upload/FileUploadSection';
import CaptionSection from './upload/CaptionSection';
import PromotionTypeSelector from './upload/PromotionTypeSelector';
import UploadButton from './upload/UploadButton';

interface PostUploadFormProps {
  onUploadSuccess: () => void;
  onShowPayment: (post: any) => void;
}

type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';

const PostUploadForm = ({ onUploadSuccess, onShowPayment }: PostUploadFormProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [promotionType, setPromotionType] = useState<PromotionType>('free_2h');
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "No file or user",
        description: "Please select a file and try again.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, selectedFile);

      if (uploadError) {
        toast({
          title: "Storage upload failed",
          description: uploadError.message,
          variant: "destructive"
        });
        setUploading(false);
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
        return;
      }

      const expiresAt = calculateExpiryTime(promotionType);
      const postType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

      // Insert post record to DB
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
          title: "Feed DB insert failed",
          description: postError.message,
          variant: "destructive"
        });
        setUploading(false);
        return;
      }

      if (promotionType !== 'free_2h') {
        onShowPayment(postData);
      } else {
        toast({
          title: "Post uploaded successfully!",
          description: "Your post is now live for 2 hours.",
        });
        onUploadSuccess();
      }

      setSelectedFile(null);
      setCaption('');
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message ?? String(error),
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Create New Post</h2>
      <div className="space-y-4">
        <FileUploadSection 
          selectedFile={selectedFile}
          onFileChange={setSelectedFile}
        />
        <CaptionSection 
          caption={caption}
          onCaptionChange={setCaption}
        />
        <PromotionTypeSelector 
          promotionType={promotionType}
          onPromotionTypeChange={setPromotionType}
        />
        <UploadButton 
          selectedFile={selectedFile}
          uploading={uploading}
          promotionType={promotionType}
          onUpload={handleUpload}
        />
      </div>
    </Card>
  );
};

export default PostUploadForm;
