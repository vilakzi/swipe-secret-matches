
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';
import PullToRefresh from './feed/PullToRefresh';
import InfiniteScroll from './feed/InfiniteScroll';

interface InstagramFeedProps {
  onLike: (itemId: string, profileId: number) => void;
  onContact: (profile: any) => void;
  onRefresh: () => void;
  likedItems: Set<string>;
}

const InstagramFeed = ({ onLike, onContact, onRefresh, likedItems }: InstagramFeedProps) => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState<'male' | 'female' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const itemsPerPage = 6;

  // Enhanced demo profiles with attractive female models
  const allProfiles = [
    {
      id: 1,
      name: "Ashley",
      age: 23,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=600&fit=crop&crop=face",
      bio: "Looking for fun connections and good vibes ✨",
      whatsapp: "+1234567890",
      location: "Miami, FL",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: [
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop", 
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800&fit=crop"
      ]
    },
    {
      id: 2,
      name: "Jessica",
      age: 25,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
      bio: "Adventure seeker, night owl 🌙 Let's make tonight memorable",
      whatsapp: "+1234567891",
      location: "Los Angeles, CA",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=600&h=800&fit=crop"]
    },
    {
      id: 3,
      name: "Sofia",
      age: 24,
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=face",
      bio: "Free spirit, here for a good time not a long time 💫",
      whatsapp: "+1234567892",
      location: "New York, NY",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=800&fit=crop"
      ]
    },
    {
      id: 4,
      name: "Maya",
      age: 22,
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face",
      bio: "Spontaneous nights and deep conversations 🔥",
      whatsapp: "+1234567893",
      location: "Chicago, IL",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop"]
    },
    {
      id: 5,
      name: "Emma",
      age: 26,
      image: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=600&fit=crop&crop=face",
      bio: "Life's too short for boring nights ✨ Let's have fun",
      whatsapp: "+1234567895",
      location: "Seattle, WA",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: [
        "https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=600&h=800&fit=crop"
      ]
    },
    {
      id: 6,
      name: "Bella",
      age: 24,
      image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
      bio: "Confident, flirty, and ready for adventure 🌹",
      whatsapp: "+1234567896",
      location: "Miami, FL",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&h=800&fit=crop"]
    },
    {
      id: 7,
      name: "Zoe",
      age: 25,
      image: "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=600&fit=crop&crop=face",
      bio: "Looking for chemistry and sparks ⚡ No games",
      whatsapp: "+1234567897",
      location: "Las Vegas, NV",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop"]
    },
    {
      id: 8,
      name: "Mia",
      age: 23,
      image: "https://images.unsplash.com/photo-1529911830035-2b4a4e8e0c3e?w=400&h=600&fit=crop&crop=face",
      bio: "Sweet but spicy 🌶️ Let's see what happens",
      whatsapp: "+1234567898",
      location: "Austin, TX",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: [
        "https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1506629905877-c19d0e339aec?w=600&h=800&fit=crop"
      ]
    }
  ];

  // Apply role-based filtering
  const filteredProfiles = useMemo(() => {
    let profiles = allProfiles;

    // Apply gender filter
    if (filterGender) {
      profiles = profiles.filter(profile => profile.gender === filterGender);
    }

    return profiles;
  }, [filterGender]);

  // Create all feed items
  const allFeedItems = useMemo(() => {
    const items: any[] = [];
    
    filteredProfiles.forEach((profile, index) => {
      // Add profile card
      items.push({
        id: `profile-${profile.id}`,
        type: 'profile',
        profile: profile
      });
      
      // Add posts for this profile
      if (profile.posts && profile.posts.length > 0) {
        profile.posts.forEach((postImage, postIndex) => {
          items.push({
            id: `post-${profile.id}-${postIndex}`,
            type: 'post',
            profile: profile,
            postImage: postImage,
            caption: `Feeling good tonight 💫`
          });
        });
      }
    });
    
    return items;
  }, [filteredProfiles]);

  // Get items for current page
  const displayedItems = useMemo(() => {
    return allFeedItems.slice(0, currentPage * itemsPerPage);
  }, [allFeedItems, currentPage, itemsPerPage]);

  const hasMoreItems = displayedItems.length < allFeedItems.length;

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMoreItems) return;
    
    setIsLoadingMore(true);
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setIsLoadingMore(false);
    }, 800);
  }, [isLoadingMore, hasMoreItems]);

  const handleRefresh = useCallback(async () => {
    setCurrentPage(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onRefresh();
  }, [onRefresh]);

  // Reset pagination when filter changes
  const handleFilterChange = useCallback((gender: 'male' | 'female' | null) => {
    setFilterGender(gender);
    setCurrentPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 overflow-x-hidden">
      <FeedHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterGender={filterGender}
        setFilterGender={handleFilterChange}
      />
      
      <div className="max-w-md mx-auto">
        <PullToRefresh onRefresh={handleRefresh} className="pt-20">
          <InfiniteScroll
            hasMore={hasMoreItems}
            isLoading={isLoadingMore}
            onLoadMore={handleLoadMore}
          >
            <FeedContent
              feedItems={displayedItems}
              likedItems={likedItems}
              isSubscribed={true}
              filterGender={filterGender}
              onLike={onLike}
              onContact={onContact}
              onRefresh={onRefresh}
              setFilterGender={handleFilterChange}
            />
          </InfiniteScroll>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default InstagramFeed;
