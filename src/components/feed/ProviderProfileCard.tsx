
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, MapPin, Share, Lock, Star, Clock, Phone, Images, User } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: 'male' | 'female';
  userType?: 'user' | 'service_provider';
  serviceCategory?: string;
  portfolio?: string[];
  rating?: number;
  reviewCount?: number;
  isAvailable?: boolean;
  services?: string[];
}

interface FeedItem {
  id: string;
  type: 'profile' | 'post';
  profile: Profile;
  postImage?: string;
  caption?: string;
}

interface ProviderProfileCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: number) => void;
  onContact: (profile: Profile) => void;
}

const ProviderProfileCard = ({ item, likedItems, isSubscribed, onLike, onContact }: ProviderProfileCardProps) => {
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();
  const [showPortfolio, setShowPortfolio] = useState(false);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Profile click triggered for provider:', item.profile.id);
    navigate(`/provider/${item.profile.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Like clicked for item:', item.id);
    onLike(item.id, item.profile.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Contact clicked for provider:', item.profile.name);
    onContact(item.profile);
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Phone clicked for provider:', item.profile.whatsapp);
    window.open(`tel:${item.profile.whatsapp}`, '_self');
  };

  const handlePortfolioToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Portfolio toggle clicked');
    setShowPortfolio(!showPortfolio);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      {/* Provider Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="relative cursor-pointer z-10" 
            onClick={handleProfileClick}
          >
            <img
              src={item.profile.image}
              alt={item.profile.name}
              className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
            />
            <OnlineStatus 
              isOnline={isUserOnline(item.profile.id.toString())} 
              size="sm"
              className="absolute -bottom-1 -right-1 pointer-events-none"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 
                className="font-semibold text-white cursor-pointer hover:text-purple-400 transition-colors z-10"
                onClick={handleProfileClick}
              >
                {item.profile.name}
              </h3>
              <Badge variant="secondary" className="bg-purple-600 text-white">
                Provider
              </Badge>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-3 h-3 mr-1" />
              {item.profile.location}
              {item.profile.isAvailable && (
                <div className="flex items-center ml-2 text-green-400">
                  <Clock className="w-3 h-3 mr-1" />
                  Available
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleProfileClick}
            variant="ghost"
            size="sm"
            className="text-purple-400 hover:bg-purple-600/20 z-10"
          >
            <User className="w-4 h-4 mr-1" />
            View Profile
          </Button>
          {!isSubscribed && (
            <Lock className="w-4 h-4 text-yellow-500" />
          )}
        </div>
      </div>

      {/* Service Category */}
      {item.profile.serviceCategory && (
        <div className="px-4 pb-2">
          <Badge className="bg-blue-600 text-white">
            {item.profile.serviceCategory}
          </Badge>
        </div>
      )}

      {/* Rating */}
      {item.profile.rating && (
        <div className="px-4 pb-2 flex items-center space-x-2">
          <div className="flex items-center">
            {renderStars(item.profile.rating)}
          </div>
          <span className="text-yellow-400 font-semibold">{item.profile.rating.toFixed(1)}</span>
          {item.profile.reviewCount && (
            <span className="text-gray-400 text-sm">({item.profile.reviewCount} reviews)</span>
          )}
        </div>
      )}

      {/* Services */}
      {item.profile.services && item.profile.services.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            {item.profile.services.slice(0, 3).map((service, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                {service}
              </Badge>
            ))}
            {item.profile.services.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                +{item.profile.services.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Profile Image */}
      <div className="relative">
        <img
          src={item.profile.image}
          alt={item.profile.name}
          className="w-full h-80 object-cover hover:opacity-95 transition-opacity cursor-pointer"
          onClick={handleProfileClick}
        />
        
        {/* Portfolio Button Overlay */}
        {item.profile.portfolio && item.profile.portfolio.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white z-20"
            onClick={handlePortfolioToggle}
          >
            <Images className="w-4 h-4 mr-1" />
            Portfolio ({item.profile.portfolio.length})
          </Button>
        )}

        {/* Click to view profile overlay */}
        <div 
          className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer z-10"
          onClick={handleProfileClick}
        >
          <Button className="bg-purple-600 hover:bg-purple-700 pointer-events-none">
            <User className="w-4 h-4 mr-2" />
            View Full Profile
          </Button>
        </div>
      </div>

      {/* Portfolio Gallery */}
      {showPortfolio && item.profile.portfolio && (
        <div className="p-4 border-t border-gray-700">
          <h4 className="text-white font-semibold mb-2">Portfolio</h4>
          <div className="grid grid-cols-3 gap-2">
            {item.profile.portfolio.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Portfolio ${index + 1}`}
                className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                onClick={handleProfileClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 z-10 ${likedItems.has(item.id) ? 'text-red-500' : 'text-white'}`}
              onClick={handleLike}
            >
              <Heart className={`w-6 h-6 ${likedItems.has(item.id) ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0 z-10"
              onClick={handleContact}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0 z-10"
              onClick={handlePhoneClick}
            >
              <Phone className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white p-0 z-10"
            >
              <Share className="w-6 h-6" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {item.profile.isAvailable ? (
              <Badge className="bg-green-600 text-white">Available</Badge>
            ) : (
              <Badge variant="outline" className="border-gray-600 text-gray-400">Busy</Badge>
            )}
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
};

export default ProviderProfileCard;
