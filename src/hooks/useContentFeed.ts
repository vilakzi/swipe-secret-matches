
import { useState, useEffect } from 'react';
import { useAdminContent } from './useAdminContent';
import { generateContentProfileCards, ContentFeedItem } from '@/utils/contentProfileGenerator';
import { toast } from '@/hooks/use-toast';

export const useContentFeed = () => {
  const { content: adminContent } = useAdminContent();
  const [contentFeedItems, setContentFeedItems] = useState<ContentFeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (adminContent.length > 0) {
      setLoading(true);
      try {
        const feedItems = generateContentProfileCards(adminContent);
        setContentFeedItems(feedItems);
      } catch (error) {
        console.error('Error generating content feed items:', error);
        toast({
          title: "Error",
          description: "Failed to load content feed items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [adminContent]);

  const handleContentLike = (itemId: string, profileId: string) => {
    // Update like count locally for immediate feedback
    setContentFeedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? {
              ...item,
              engagement: {
                ...item.engagement,
                likes: item.engagement.likes + 1
              }
            }
          : item
      )
    );

    toast({
      title: "Liked!",
      description: "You liked this content",
    });
  };

  const handleContentShare = (itemId: string) => {
    // Update share count locally
    setContentFeedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? {
              ...item,
              engagement: {
                ...item.engagement,
                shares: item.engagement.shares + 1
              }
            }
          : item
      )
    );

    // Copy link to clipboard
    const item = contentFeedItems.find(item => item.id === itemId);
    if (item) {
      navigator.clipboard.writeText(item.postImage || '');
      toast({
        title: "Shared!",
        description: "Content link copied to clipboard",
      });
    }
  };

  return {
    contentFeedItems,
    loading,
    handleContentLike,
    handleContentShare,
  };
};
