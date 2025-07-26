import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid, User, Settings, MoreHorizontal } from 'lucide-react';

interface InstagramProfileHeaderProps {
  profile: {
    id: string;
    display_name: string;
    bio?: string;
    profile_image_url?: string;
    postsCount?: number;
    followersCount?: number;
    followingCount?: number;
    isFollowing?: boolean;
    isOwnProfile?: boolean;
    verifications?: {
      photoVerified?: boolean;
      emailVerified?: boolean;
    };
  };
  onFollow?: () => void;
  onMessage?: () => void;
  onEditProfile?: () => void;
}

const InstagramProfileHeader = ({
  profile,
  onFollow,
  onMessage,
  onEditProfile,
}: InstagramProfileHeaderProps) => {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <div className="bg-black text-white">
      {/* Profile Info Section */}
      <div className="p-4">
        <div className="flex items-start gap-4 mb-4">
          {/* Profile Picture */}
          <Avatar className="w-20 h-20 md:w-24 md:h-24">
            <AvatarImage 
              src={profile.profile_image_url || '/placeholder.svg'} 
              className="object-cover"
            />
            <AvatarFallback className="bg-gray-600 text-white text-xl">
              {profile.display_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          {/* Stats and Actions */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold">{profile.display_name}</h1>
              <div className="flex items-center gap-2">
                {profile.verifications?.photoVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="font-semibold">{profile.postsCount || 0}</div>
                <div className="text-xs text-gray-400">posts</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{profile.followersCount || 0}</div>
                <div className="text-xs text-gray-400">followers</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{profile.followingCount || 0}</div>
                <div className="text-xs text-gray-400">following</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {profile.isOwnProfile ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-white border-gray-600"
                    onClick={onEditProfile}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-gray-600"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant={profile.isFollowing ? "outline" : "default"}
                    size="sm" 
                    className="flex-1"
                    onClick={onFollow}
                  >
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-gray-600"
                    onClick={onMessage}
                  >
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mb-4">
            <p className="text-sm text-gray-100 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-t border-gray-700">
        <div className="flex">
          <button
            className={`flex-1 flex items-center justify-center py-3 ${
              activeTab === 'posts' 
                ? 'border-t-2 border-white text-white' 
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            className={`flex-1 flex items-center justify-center py-3 ${
              activeTab === 'tagged' 
                ? 'border-t-2 border-white text-white' 
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('tagged')}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramProfileHeader;