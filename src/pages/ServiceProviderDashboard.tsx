
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import PostUploadForm from '@/components/dashboard/PostUploadForm';
import PostsList from '@/components/dashboard/PostsList';
import BottomNavigation from '@/components/navigation/BottomNavigation';


const ServiceProviderDashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
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

  const handleShowPayment = (post: any) => {
    setPendingPost(post);
    // For Instagram-style, just add directly without payment
    handleAddPostToFeed(post);
  };

  const handleAddPostToFeed = (newPost: any) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePaymentSuccess = async () => {
    if (pendingPost) {
      await supabase
        .from('posts')
        .update({ payment_status: 'paid' })
        .eq('id', pendingPost.id);

      toast({
        title: "Payment successful!",
        description: `Your post is now promoted for ${pendingPost.promotion_type === 'paid_8h' ? '8' : '12'} hours.`,
      });

      fetchPosts();
      setPendingPost(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <DashboardHeader />
        
        <PostUploadForm 
          onUploadSuccess={fetchPosts}
          onShowPayment={handleShowPayment}
          onAddPostToFeed={handleAddPostToFeed}
        />

        <PostsList posts={posts} />
      </div>
      
      {/* Unified Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ServiceProviderDashboard;
