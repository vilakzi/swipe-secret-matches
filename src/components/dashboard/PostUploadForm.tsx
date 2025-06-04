
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, Clock, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PostUploadFormProps {
  onUploadSuccess: () => void;
  onShowPayment: (post: any) => void;
}

const PostUploadForm = ({ onUploadSuccess, onShowPayment }: PostUploadFormProps) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [promotionType, setPromotionType] = useState<'free_2h' | 'paid_8h' | 'paid_12h'>('free_2h');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file type",
          description: "Please select an image or video file.",
          variant: "destructive",
        });
        return;
      }

      if (isVideo && file.size > 30 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video files must be 30MB or less.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
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

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      const expiresAt = calculateExpiryTime(promotionType);
      const postType = selectedFile.type.startsWith('image/') ? 'image' : 'video';

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

      if (postError) throw postError;

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
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getPromotionPrice = (type: string) => {
    switch (type) {
      case 'paid_8h':
        return 'R20';
      case 'paid_12h':
        return 'R39';
      default:
        return 'Free';
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Create New Post</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Image or Video
          </label>
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="bg-gray-800 border-gray-600 text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            Images: Any size | Videos: Max 30MB
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Caption/Description (Optional)
          </label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption for your post..."
            className="bg-gray-800 border-gray-600 text-white"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Promotion Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={promotionType === 'free_2h' ? "default" : "outline"}
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setPromotionType('free_2h')}
            >
              <Clock className="w-5 h-5 mb-1" />
              <span className="text-sm">2 Hours</span>
              <span className="text-xs text-green-400">Free</span>
            </Button>
            <Button
              type="button"
              variant={promotionType === 'paid_8h' ? "default" : "outline"}
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setPromotionType('paid_8h')}
            >
              <Crown className="w-5 h-5 mb-1" />
              <span className="text-sm">8 Hours</span>
              <span className="text-xs text-yellow-400">R20</span>
            </Button>
            <Button
              type="button"
              variant={promotionType === 'paid_12h' ? "default" : "outline"}
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => setPromotionType('paid_12h')}
            >
              <Crown className="w-5 h-5 mb-1" />
              <span className="text-sm">12 Hours</span>
              <span className="text-xs text-purple-400">R39</span>
            </Button>
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {uploading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Post - {getPromotionPrice(promotionType)}</span>
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default PostUploadForm;
