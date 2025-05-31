
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';

const InstagramFeed = () => {
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState<'male' | 'female' | null>(null);

  // Mock data for profiles and posts
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
    }
  ];

  // Filter profiles based on gender filter
  const filteredProfiles = useMemo(() => {
    if (!filterGender) return allProfiles;
    return allProfiles.filter(profile => profile.gender === filterGender);
  }, [filterGender]);

  // Create feed items (mix of profiles and posts)
  const feedItems = useMemo(() => {
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

  const handleLike = (itemId: string, profileId: number) => {
    if (!isSubscribed) {
      toast({
        title: "Subscribe to like profiles",
        description: "Upgrade to premium to like profiles and send messages.",
        variant: "destructive",
      });
      return;
    }

    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(itemId)) {
        newLiked.delete(itemId);
      } else {
        newLiked.add(itemId);
      }
      return newLiked;
    });

    toast({
      title: likedItems.has(itemId) ? "Like removed" : "Profile liked!",
      description: likedItems.has(itemId) ? "You unliked this profile." : "Your like has been sent!",
    });
  };

  const handleContact = (profile: any) => {
    if (!isSubscribed) {
      toast({
        title: "Subscribe to contact",
        description: "Upgrade to premium to contact profiles.",
        variant: "destructive",
      });
      return;
    }

    window.open(`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleRefresh = () => {
    toast({
      title: "Feed refreshed",
      description: "Loading new profiles...",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <FeedHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
      />
      
      <div className="max-w-md mx-auto">
        <FeedContent
          feedItems={feedItems}
          likedItems={likedItems}
          isSubscribed={isSubscribed}
          filterGender={filterGender}
          onLike={handleLike}
          onContact={handleContact}
          onRefresh={handleRefresh}
          setFilterGender={setFilterGender}
        />
      </div>
    </div>
  );
};

export default InstagramFeed;
