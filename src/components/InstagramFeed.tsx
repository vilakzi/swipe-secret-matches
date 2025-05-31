
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MapPin, RotateCcw, Share, Lock, Filter } from 'lucide-react';
import OnlineStatus from './OnlineStatus';
import { usePresence } from '@/hooks/usePresence';

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
  const { isUserOnline } = usePresence();
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

  const renderProfileCard = (item: FeedItem) => (
    <Card key={item.id} className="bg-gray-800 border-gray-700 mb-4">
      {/* Profile Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={item.profile.image}
              alt={item.profile.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <OnlineStatus 
              isOnline={isUserOnline(item.profile.id.toString())} 
              size="sm"
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div>
            <h3 className="font-semibold text-white">{item.profile.name}, {item.profile.age}</h3>
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {item.profile.location}
              {item.profile.gender && (
                <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded-full">
                  {item.profile.gender}
                </span>
              )}
            </div>
          </div>
        </div>
        {!isSubscribed && (
          <Lock className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Profile Image */}
      <div className="relative">
        <img
          src={item.profile.image}
          alt={item.profile.name}
          className="w-full h-80 object-cover"
        />
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 ${likedItems.has(item.id) ? 'text-red-500' : 'text-white'}`}
              onClick={() => handleLike(item.id, item.profile.id)}
            >
              <Heart className={`w-6 h-6 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0"
              onClick={() => handleContact(item.profile)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0"
            >
              <Share className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Bio */}
        <div className="text-white">
          <span className="font-semibold">{item.profile.name}</span>
          <span className="ml-2 text-gray-300">{item.profile.bio}</span>
        </div>
      </div>
    </Card>
  );

  const renderPostCard = (item: FeedItem) => (
    <Card key={item.id} className="bg-gray-800 border-gray-700 mb-4">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={item.profile.image}
              alt={item.profile.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <OnlineStatus 
              isOnline={isUserOnline(item.profile.id.toString())} 
              size="sm"
              className="absolute -bottom-1 -right-1"
            />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">{item.profile.name}</h4>
            <p className="text-gray-400 text-xs">{item.profile.location}</p>
          </div>
        </div>
        {!isSubscribed && (
          <Lock className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Post Image */}
      <div className="relative">
        <img
          src={item.postImage}
          alt="Post"
          className="w-full h-72 object-cover"
        />
      </div>

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 ${likedItems.has(item.id) ? 'text-red-500' : 'text-white'}`}
              onClick={() => handleLike(item.id, item.profile.id)}
            >
              <Heart className={`w-6 h-6 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0"
              onClick={() => handleContact(item.profile)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0"
            >
              <Share className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Caption */}
        <div className="text-white">
          <span className="font-semibold">{item.profile.name}</span>
          <span className="ml-2 text-gray-300">{item.caption}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-md mx-auto h-full overflow-y-auto">
      {/* Filter Controls */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Feed</h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-3 flex items-center space-x-2">
            <Button
              variant={filterGender === null ? "default" : "ghost"}
              size="sm"
              className={filterGender === null ? "bg-purple-600" : "text-white"}
              onClick={() => setFilterGender(null)}
            >
              All
            </Button>
            <Button
              variant={filterGender === 'male' ? "default" : "ghost"}
              size="sm"
              className={filterGender === 'male' ? "bg-purple-600" : "text-white"}
              onClick={() => setFilterGender('male')}
            >
              Male
            </Button>
            <Button
              variant={filterGender === 'female' ? "default" : "ghost"}
              size="sm"
              className={filterGender === 'female' ? "bg-purple-600" : "text-white"}
              onClick={() => setFilterGender('female')}
            >
              Female
            </Button>
          </div>
        )}
      </div>

      <div className="pb-20">
        {feedItems.length > 0 ? (
          feedItems.map(item => 
            item.type === 'profile' ? renderProfileCard(item) : renderPostCard(item)
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No profiles found for the selected filter.</p>
            <Button
              variant="ghost"
              className="text-purple-400 mt-2"
              onClick={() => setFilterGender(null)}
            >
              Clear filters
            </Button>
          </div>
        )}
        
        {/* Refresh Button */}
        {feedItems.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={onRefresh}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramFeed;
