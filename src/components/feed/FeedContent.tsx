import * as React from 'react';
import { useState } from 'react';
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
import FeedFilters, { SortOption, FilterOption } from './FeedFilters';

interface FeedContentProps {
  feedItems: FeedItem[];
  likedItems: Set&lt;string&gt;;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onRefresh?: () => void;
  engagementTracker?: any;
}

const FeedContent = ({
  feedItems,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onRefresh,
  engagementTracker
}: FeedContentProps) => {
  const [sortOption, setSortOption] = useState&lt;SortOption&gt;('newest');
  const [filterOption, setFilterOption] = useState&lt;FilterOption&gt;('all');
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

  // Apply sorting to feed items
  const sortFeedItems = (items: any[]) => {
    switch (sortOption) {
      case 'oldest':
        return [...items].sort((a, b) => 
          new Date(a.createdAt || a.timestamp || 0).getTime() - 
          new Date(b.createdAt || b.timestamp || 0).getTime()
        );
      case 'popular':
        return [...items].sort((a, b) => 
          (b.likes?.length || 0) - (a.likes?.length || 0)
        );
      case 'newest':
      default:
        return [...items].sort((a, b) => 
          new Date(b.createdAt || b.timestamp || 0).getTime() - 
          new Date(a.createdAt || a.timestamp || 0).getTime()
        );
    }
  };

  // Apply filtering to feed items
  const filterFeedItems = (items: any[]) => {
    switch (filterOption) {
      case 'posts':
        return items.filter(item => item.type === 'post');
      case 'profiles':
        return items.filter(item => item.type === 'profile');
      case 'welcome':
        return items.filter(item => item.isWelcome);
      case 'admin':
        return items.filter(item => item.isAdminCard);
      case 'all':
      default:
        return items;
    }
  };

  // Apply sorting and filtering to allFeedItems
  const processedFeedItems = filterFeedItems(sortFeedItems(allFeedItems));

  return (
    &lt;div className=&quot;space-y-6 pb-6&quot; role=&quot;list&quot; aria-label=&quot;Social feed items&quot;&gt;
      &lt;FeedFilters 
        currentSort={sortOption}
        currentFilter={filterOption}
        onSortChange={setSortOption}
        onFilterChange={setFilterOption}
      /&gt;
      
      {adminFeed.length &gt; 0 &amp;&amp; filterOption !== 'posts' &amp;&amp; filterOption !== 'profiles' &amp;&amp; (
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
        userFeed={processedFeedItems}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        onLike={onLike}
        onContact={onContact}
      /&gt;
    &lt;/div&gt;
  );
};

export default FeedContent;