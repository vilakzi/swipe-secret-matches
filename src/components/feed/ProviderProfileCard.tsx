import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderHeader from './provider/ProviderHeader';
import ProviderRating from './provider/ProviderRating';
import ProviderServices from './provider/ProviderServices';
import ProviderImage from './provider/ProviderImage';
import ProviderPortfolio from './provider/ProviderPortfolio';
import ProviderActions from './provider/ProviderActions';

interface Profile {
  id: string;
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
  isRealAccount?: boolean;
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
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const ProviderProfileCard = ({ item, likedItems, isSubscribed, onLike, onContact }: ProviderProfileCardProps) => {
  const navigate = useNavigate();
  const [showPortfolio, setShowPortfolio] = useState(false);

  const handleProfileClick = () => {
    console.log('Navigating to provider profile:', item.profile.id);
    navigate(`/provider/${item.profile.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Like clicked for item:', item.id);
    onLike(item.id, item.profile.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Contact clicked for provider:', item.profile.name);
    onContact(item.profile);
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Phone clicked for provider:', item.profile.whatsapp);
    window.open(`tel:${item.profile.whatsapp}`, '_self');
  };

  const handlePortfolioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Portfolio toggle clicked');
    setShowPortfolio(!showPortfolio);
  };

  // Open WhatsApp with preset message for providers
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const num = item.profile.whatsapp?.replace(/[^0-9]/g, "");
    if (num) {
      const message = encodeURIComponent("Hi, I got your number from ConnectsBuddy looking for hook up services/content.");
      window.open(`https://wa.me/${num}?text=${message}`, '_blank');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      <ProviderHeader
        profile={item.profile}
        isOnline={false}
        isSubscribed={isSubscribed}
        onProfileClick={handleProfileClick}
      />

      <ProviderServices
        serviceCategory={item.profile.serviceCategory}
        services={item.profile.services}
      />

      {item.profile.rating && (
        <ProviderRating
          rating={item.profile.rating}
          reviewCount={item.profile.reviewCount}
        />
      )}

      <ProviderImage
        image={item.profile.image}
        name={item.profile.name}
        portfolio={item.profile.portfolio}
        onProfileClick={handleProfileClick}
        onPortfolioToggle={handlePortfolioToggle}
      />

      {showPortfolio && item.profile.portfolio && (
        <ProviderPortfolio
          portfolio={item.profile.portfolio}
          onImageClick={handleProfileClick}
        />
      )}

      {/* Professional, clean action row only */}
      <ProviderActions
        profile={item.profile}
        itemId={item.id}
        likedItems={likedItems}
        onLike={handleLike}
        onContact={handleContact}
        onPhoneClick={handlePhoneClick}
        onWhatsAppClick={handleWhatsAppClick}
      />
    </Card>
  );
};

export default ProviderProfileCard;
