
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Image, Video, Clock, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PaymentModal from '@/components/PaymentModal';

const ServiceProviderDashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [promotionType, setPromotionType] = useState<'free_2h' | 'paid_8h' | 'paid_12h'>('free_2h');
  const [uploading, setUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPost, setPendingPost] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('provider_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
    } else {
      setPosts(data || []);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
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

      // Validate video size (30MB max)
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
      // Upload file to storage
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

      // Create post record
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          provider_id: user.id,
          content_url: publicUrl,
          post_type: postType,
          promotion_type: promotionType,
          expires_at: expiresAt.toISOString(),
          is_promoted: promotionType !== 'free_2h',
          payment_status: promotionType === 'free_2h' ? 'paid' : 'pending'
        })
        .select()
        .single();

      if (postError) throw postError;

      // If paid promotion, show payment modal
      if (promotionType !== 'free_2h') {
        setPendingPost(postData);
        setShowPaymentModal(true);
      } else {
        toast({
          title: "Post uploaded successfully!",
          description: "Your post is now live for 2 hours.",
        });
        fetchPosts();
      }

      setSelectedFile(null);
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

  const handlePaymentSuccess = async () => {
    if (pendingPost) {
      // Update post payment status
      await supabase
        .from('posts')
        .update({ payment_status: 'paid' })
        .eq('id', pendingPost.id);

      toast({
        title: "Payment successful!",
        description: `Your post is now promoted for ${promotionType === 'paid_8h' ? '8' : '12'} hours.`,
      });

      fetchPosts();
      setPendingPost(null);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Service Provider Dashboard</h1>
          <p className="text-gray-400">Manage your posts and promotions</p>
        </div>

        {/* Upload Section */}
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

        {/* Posts List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Your Posts</h2>
          {posts.length === 0 ? (
            <Card className="bg-black/20 backdrop-blur-md border-gray-700 p-8 text-center">
              <p className="text-gray-400">No posts yet. Create your first post!</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="bg-black/20 backdrop-blur-md border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                        {post.post_type === 'image' ? (
                          <Image className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Video className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {post.post_type === 'image' ? 'Image' : 'Video'} Post
                        </p>
                        <p className="text-sm text-gray-400">
                          Expires: {new Date(post.expires_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {post.payment_status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        post.promotion_type === 'free_2h' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {post.promotion_type === 'free_2h' ? '2H Free' : 
                         post.promotion_type === 'paid_8h' ? '8H Promoted' : '12H Promoted'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          onSuccess={handlePaymentSuccess}
          onClose={() => {
            setShowPaymentModal(false);
            setPendingPost(null);
          }}
        />
      )}
    </div>
  );
};

export default ServiceProviderDashboard;
