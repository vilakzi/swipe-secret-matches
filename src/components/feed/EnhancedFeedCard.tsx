
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User, MapPin, Calendar, Phone, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name: string | null;
  age: number | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  user_type: 'user' | 'service_provider' | 'admin' | 'superadmin' | null;
  created_at: string;
  whatsapp: string | null;
}

interface EnhancedFeedCardProps {
  profile: Profile;
  onLike: (profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const EnhancedFeedCard = ({ profile, onLike, onContact }: EnhancedFeedCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 20) + 1);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
      toast({
        title: "Like removed",
        description: "You unliked this profile",
      });
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
      onLike(profile.id);
    }
  };

  const isServiceProvider = profile.user_type === 'service_provider';
  const isNewJoiner = new Date(profile.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className="bg-gray-800 border-gray-700 p-6 hover:bg-gray-750 transition-colors duration-200">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-600">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.display_name || 'Profile'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>
          {isNewJoiner && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              New
            </div>
          )}
          {isServiceProvider && (
            <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
              <Star className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-white">
              {profile.display_name || 'Anonymous User'}
            </h3>
            {profile.age && (
              <span className="text-gray-400 font-medium">{profile.age}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
            {profile.location && (
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {profile.location}
              </span>
            )}
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(profile.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="mb-3">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              isServiceProvider 
                ? 'bg-purple-900 text-purple-300' 
                : 'bg-blue-900 text-blue-300'
            }`}>
              {isServiceProvider ? 'Service Provider' : 'User'}
            </span>
          </div>
          
          {profile.bio && (
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{profile.bio}</p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleLike}
                className={`flex items-center space-x-1 transition-colors ${
                  isLiked 
                    ? 'bg-red-900/30 border-red-600 text-red-400 hover:bg-red-900/50' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onContact(profile)}
                className="flex items-center space-x-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact</span>
              </Button>
            </div>
            
            {profile.whatsapp && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(`https://wa.me/${profile.whatsapp}`, '_blank')}
                className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
              >
                <Phone className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedFeedCard;
