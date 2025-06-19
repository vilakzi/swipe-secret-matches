
import React, { useState, useEffect } from 'react';
import PostUploadForm from '@/components/dashboard/PostUploadForm';
import FeedContent from '@/components/FeedContent';
import { supabase } from '@/integrations/supabase/client';

const Feed = () => {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch posts from the correct table
  useEffect(() => {
    const fetchFeed = async () => {
      const { data, error } = await supabase
        .from('posts') // ✅ Correct table name
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setFeedItems(data);
    };
    fetchFeed();
  }, []);

  // Add new post to feed instantly
  const handleAddPostToFeed = (newPost: any) => {
    setFeedItems((prev) => [newPost, ...prev]);
  };

  return (
    <div>
      <PostUploadForm
        onUploadSuccess={() => {/* optional: show toast, etc. */}}
        onShowPayment={(post) => {/* handle payment UI */}}
        onAddPostToFeed={handleAddPostToFeed}
      />
      <FeedContent
        feedItems={feedItems}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={() => {}}
        onContact={() => {}}
        onRefresh={() => {}}
      />
    </div>
  );
};

export default Feed;
