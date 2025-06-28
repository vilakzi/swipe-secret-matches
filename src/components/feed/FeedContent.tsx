import * as React from 'react';
import AdminTileCarousel from './AdminTileCarousel';
import { useAuth } from '@/contexts/AuthContext';
import { useContentFeed } from '@/hooks/useContentFeed';
import { useUserRole } from '@/hooks/useUserRole';
// Utility imports
import { isValidMedia } from '@/utils/feed/mediaUtils';
import { isProfileImageChanged } from '@/utils/feed/profileUtils';
import { isNewJoiner } from '@/utils/feed/joinerUtils';
import { FeedItem, Profile } from './types/feedTypes';
import NormalFeedList from './NormalFeedList';

interface FeedContentProps {
  feedItems: FeedItem[];
  likedItems: Set&lt;string&gt;;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onRefresh: () => void;
}

const FeedContent = ({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onRefresh
}: FeedContentProps) => {
  const { contentFeedItems, handleContentLike, handleContentShare } = useContentFeed();
  const { user } = useAuth();
  const { role } = useUserRole();

  const adminRoles = [&quot;admin&quot;, &quot;superadmin&quot;];

  // Create wrapper functions to match expected signatures
  const handleContentLikeWrapper = async (contentId: string, profileId: string) => {
    handleContentLike(contentId, profileId);
  };

  const handleContentShareWrapper = async (contentId: string) => {
    handleContentShare(contentId);
  };

  // Enrich feed items with role/joinDate for easier checks
  const enrichedFeedItems = feedItems.map(item => ({
    ...item,
    isAdminCard: false,
    profile: {
      ...item.profile,
      role: item.profile.role || item.profile.userType,
      joinDate: item.profile.joinDate
    }
  }));

  // Convert content feed items to FeedItem type compatible format
  const contentAsRegularFeed = contentFeedItems.filter(
    c =&gt; !!c &amp;&amp; !!c.id &amp;&amp; isValidMedia(c.postImage)
  ).map(item =&gt; ({
    ...item,
    isContent: true,
    isAdminCard: true,
    // Ensure the profile matches FeedItem's Profile type
    profile: {
      ...item.profile,
      userType: item.profile.userType as &quot;user&quot; | &quot;service_provider&quot; | &quot;admin&quot; | &quot;superadmin&quot;
    }
  } as FeedItem &amp; { isContent: true; isAdminCard: true }));

  // Admin carousel: posts from admin/superadmin, and published content feed
  const adminFeed = [
    ...contentAsRegularFeed,
    ...enrichedFeedItems.filter(item =&gt;
      adminRoles.includes(String(item.profile.role).toLowerCase()) &amp;&amp;
      ((item.type === &#39;post&#39; &amp;&amp; isValidMedia(item.postImage)) ||
        (item.type === &#39;profile&#39; &amp;&amp; isProfileImageChanged(item.profile.image)))
    ).map(item =&gt; ({
      ...item,
      isAdminCard: true
    }))
  ];

  // All feed items combined for normal display
  const allFeedItems = [
    ...contentAsRegularFeed,
    ...enrichedFeedItems.filter(item =&gt; {
      const hasMedia = (item.profile.posts &amp;&amp; item.profile.posts.some(isValidMedia)) || 
                      (item.type === &#39;post&#39; &amp;&amp; isValidMedia(item.postImage));
      const imgChanged = isProfileImageChanged(item.profile.image);
      const newJoiner = isNewJoiner(item.profile.joinDate);
      
      return hasMedia || imgChanged || newJoiner;
    }).map(item =&gt; ({
      ...item,
      isWelcome: isNewJoiner(item.profile.joinDate) &amp;&amp; 
                 (!item.profile.posts || item.profile.posts.length === 0) &amp;&amp; 
                 !isProfileImageChanged(item.profile.image)
    }))
  ];

  return (
    &lt;div className=&quot;space-y-6 px-4 pb-6&quot; role=&quot;list&quot; aria-label=&quot;Social feed items&quot;&gt;
      {adminFeed.length &gt; 0 &amp;&amp; (
        &lt;AdminTileCarousel
          adminFeed={adminFeed}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          onLike={onLike}
          onContact={onContact}
          onContentLike={handleContentLikeWrapper}
          onContentShare={handleContentShareWrapper}
          tilesToShow={2}
          rotationIntervalMs={5000}
        /&gt;
      )}
      
      &lt;NormalFeedList
        userFeed={allFeedItems}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={onLike}
        onContact={onContact}
      /&gt;
    &lt;/div&gt;
  );
};

export default FeedContent;