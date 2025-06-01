
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

  // Enhanced demo profiles with working placeholder images
  const allProfiles = [
    {
      id: 1,
      name: "Ashley",
      age: 23,
      image: "https://picsum.photos/400/600?random=1",
      bio: "Looking for fun connections and good vibes ✨",
      whatsapp: "+1234567890",
      location: "Miami, FL",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=11", "https://picsum.photos/600/800?random=12"]
    },
    {
      id: 2,
      name: "Jessica",
      age: 25,
      image: "https://picsum.photos/400/600?random=2",
      bio: "Adventure seeker, night owl 🌙 Let's make tonight memorable",
      whatsapp: "+1234567891",
      location: "Los Angeles, CA",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=21"]
    },
    {
      id: 3,
      name: "Sofia",
      age: 24,
      image: "https://picsum.photos/400/600?random=3",
      bio: "Free spirit, here for a good time not a long time 💫",
      whatsapp: "+1234567892",
      location: "New York, NY",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=31", "https://picsum.photos/600/800?random=32"]
    },
    {
      id: 4,
      name: "Maya",
      age: 22,
      image: "https://picsum.photos/400/600?random=4",
      bio: "Spontaneous nights and deep conversations 🔥",
      whatsapp: "+1234567893",
      location: "Chicago, IL",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=41"]
    },
    {
      id: 5,
      name: "Ryan",
      age: 28,
      image: "https://picsum.photos/400/600?random=5",
      bio: "Looking for chemistry and connection 💫",
      whatsapp: "+1234567894",
      location: "Austin, TX",
      gender: 'male' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=51"]
    },
    {
      id: 6,
      name: "Emma",
      age: 26,
      image: "https://picsum.photos/400/600?random=6",
      bio: "Life's too short for boring nights ✨ Let's have fun",
      whatsapp: "+1234567895",
      location: "Seattle, WA",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=61", "https://picsum.photos/600/800?random=62"]
    },
    {
      id: 7,
      name: "Bella",
      age: 24,
      image: "https://picsum.photos/400/600?random=7",
      bio: "Confident, flirty, and ready for adventure 🌹",
      whatsapp: "+1234567896",
      location: "Miami, FL",
      gender: 'female' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=71"]
    },
    {
      id: 8,
      name: "Alex",
      age: 29,
      image: "https://picsum.photos/400/600?random=8",
      bio: "Good vibes only, let's see where the night takes us 🔥",
      whatsapp: "+1234567897",
      location: "Las Vegas, NV",
      gender: 'male' as const,
      userType: 'user' as const,
      posts: ["https://picsum.photos/600/800?random=81"]
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
