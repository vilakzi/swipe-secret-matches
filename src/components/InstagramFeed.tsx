
import { useState, useEffect } from 'react';
import FeedHeader from './feed/FeedHeader';
import FeedContent from './feed/FeedContent';

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  liked?: boolean;
  posts?: string[];
}

interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

interface InstagramFeedProps {
  profiles: Profile[];
  onLike: (profileId: number) => void;
  onContact: (profile: Profile) => void;
  onRefresh: () => void;
  isSubscribed?: boolean;
}

const InstagramFeed = ({ profiles, onLike, onContact, onRefresh, isSubscribed = false }: InstagramFeedProps) => {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [filterGender, setFilterGender] = useState<'male' | 'female' | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter profiles based on gender
  const filteredProfiles = profiles.filter(
    (profile) => !filterGender || profile.gender === filterGender
  );

  // Generate feed items with filtered profiles and their posts
  useEffect(() => {
    const items: FeedItem[] = [];
    
    filteredProfiles.forEach(profile => {
      // Add profile as main item
      items.push({
        id: `profile-${profile.id}`,
        type: 'profile',
        profile
      });

      // Add posts for each profile (mock posts)
      const postCount = Math.floor(Math.random() * 3) + 1; // 1-3 posts per profile
      for (let i = 0; i < postCount; i++) {
        items.push({
          id: `post-${profile.id}-${i}`,
          type: 'post',
          profile,
          postImage: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`,
          caption: `Check out this amazing moment! #life #fun #${profile.location.replace(/\s+/g, '').toLowerCase()}`
        });
      }
    });

    // Shuffle items for more dynamic feed
    const shuffled = items.sort(() => Math.random() - 0.5);
    setFeedItems(shuffled);
  }, [filteredProfiles]);

  const handleLike = (itemId: string, profileId: number) => {
    if (!isSubscribed) {
      onLike(profileId); // This will trigger paywall
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
    onLike(profileId);
  };

  const handleContact = (profile: Profile) => {
    if (!isSubscribed) {
      onContact(profile); // This will trigger paywall
      return;
    }
    onContact(profile);
  };

  return (
    <div className="max-w-md mx-auto h-full overflow-y-auto">
      <FeedHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
      />
      
      <FeedContent
        feedItems={feedItems}
        likedItems={likedItems}
        isSubscribed={isSubscribed}
        filterGender={filterGender}
        onLike={handleLike}
        onContact={handleContact}
        onRefresh={onRefresh}
        setFilterGender={setFilterGender}
      />
    </div>
  );
};

export default InstagramFeed;
