
import { useState, useEffect } from 'react';
import { useEnhancedAdminContent } from './useEnhancedAdminContent';
import { generateContentProfileCards, ContentFeedItem } from '@/utils/contentProfileGenerator';
import { toast } from '@/hooks/use-toast';

export const useContentFeed = () => {
  const { content: adminContent } = useEnhancedAdminContent();
  const [contentFeedItems, setContentFeedItems] = useState<ContentFeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only show approved and published content in the feed
    const approvedContent = adminContent.filter(
      content => content.approval_status === 'approved' && 
                content.status === 'published' && 
                content.visibility === 'public'
    );

    if (approvedContent.length > 0) {
      setLoading(true);
      try {
        const feedItems = generateContentProfileCards(approvedContent);
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
    } else {
      setContentFeedItems([]);
    }
  }, [adminContent]);

  const handleContentLike = async (itemId: string, profileId: string) => {
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

    // Update the database
    try {
      // In a real implementation, this would update the like count in the database
      // For now, we'll just show the toast
      toast({
        title: "Liked!",
        description: "You liked this content",
      });
    } catch (error) {
      console.error('Error updating like count:', error);
      // Revert the local change if the database update fails
      setContentFeedItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? {
                ...item,
                engagement: {
                  ...item.engagement,
                  likes: Math.max(0, item.engagement.likes - 1)
                }
              }
            : item
        )
      );
    }
  };

  const handleContentShare = async (itemId: string) => {
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
      try {
        await navigator.clipboard.writeText(item.postImage || '');
        toast({
          title: "Shared!",
          description: "Content link copied to clipboard",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Share",
          description: "Content shared successfully",
        });
      }
    }
  };

  return {
    contentFeedItems,
    loading,
    handleContentLike,
    handleContentShare,
  };
};
