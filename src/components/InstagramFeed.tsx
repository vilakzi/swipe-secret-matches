
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
  const itemsPerPage = 6; // Show 6 items per page

  // Mock data for profiles and posts - always show to everyone
  const allProfiles = [
    {
      id: 1,
      name: "Sarah",
      age: 24,
      image: "/placeholder.svg",
      bio: "Love traveling and photography 📸",
      whatsapp: "+1234567890",
      location: "New York, NY",
      gender: 'female' as const,
      posts: ["/placeholder.svg", "/placeholder.svg"]
    },
    {
      id: 2,
      name: "Mike",
      age: 28,
      image: "/placeholder.svg",
      bio: "Fitness enthusiast and chef 🍳",
      whatsapp: "+1234567891",
      location: "Los Angeles, CA",
      gender: 'male' as const,
      posts: ["/placeholder.svg"]
    },
    {
      id: 3,
      name: "Emma",
      age: 26,
      image: "/placeholder.svg",
      bio: "Artist and coffee lover ☕",
      whatsapp: "+1234567892",
      location: "Seattle, WA",
      gender: 'female' as const,
      posts: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    },
    {
      id: 4,
      name: "Alex",
      age: 30,
      image: "/placeholder.svg",
      bio: "Software engineer and gamer 🎮",
      whatsapp: "+1234567893",
      location: "Austin, TX",
      gender: 'male' as const,
      posts: ["/placeholder.svg", "/placeholder.svg"]
    },
    {
      id: 5,
      name: "Jessica",
      age: 27,
      image: "/placeholder.svg",
      bio: "Yoga instructor and nature lover 🌿",
      whatsapp: "+1234567894",
      location: "Portland, OR",
      gender: 'female' as const,
      posts: ["/placeholder.svg", "/placeholder.svg"]
    },
    {
      id: 6,
      name: "David",
      age: 32,
      image: "/placeholder.svg",
      bio: "Musician and food enthusiast 🎵",
      whatsapp: "+1234567895",
      location: "Nashville, TN",
      gender: 'male' as const,
      posts: ["/placeholder.svg"]
    }
  ];

  // Filter profiles based on gender filter
  const filteredProfiles = useMemo(() => {
    if (!filterGender) return allProfiles;
    return allProfiles.filter(profile => profile.gender === filterGender);
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
            caption: `Post ${postIndex + 1} from ${profile.name}`
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
