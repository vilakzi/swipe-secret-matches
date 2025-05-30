import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Heart } from 'lucide-react';
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
  liked?: boolean;
}

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  disabled?: boolean;
}

const ProfileCard = ({ profile, onSwipe, disabled = false }: ProfileCardProps) => {
  const { isUserOnline } = usePresence();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    }
    
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Hi ${profile.name}! I saw your profile and would love to chat.`);
    window.open(`https://wa.me/${profile.whatsapp.replace('+', '')}?text=${message}`, '_blank');
  };

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'all 0.3s ease-out',
    opacity: disabled ? 0.6 : 1,
  };

  const overlayOpacity = Math.min(Math.abs(dragOffset.x) / 100, 1);
  const isLikeDirection = dragOffset.x > 0;

  return (
    <div className="relative w-80 h-96 mx-auto select-none">
      <Card
        ref={cardRef}
        className={`w-full h-full bg-gray-800 border-gray-700 overflow-hidden cursor-grab active:cursor-grabbing relative ${
          profile.liked ? 'ring-2 ring-pink-500' : ''
        }`}
        style={cardStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
      >
        {/* Profile Image */}
        <div 
          className="w-full h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${profile.image})` }}
        >
          {/* Online Status Indicator */}
          <div className="absolute top-2 left-2">
            <OnlineStatus 
              isOnline={isUserOnline(profile.id.toString())} 
              size="md"
              className="bg-gray-900/50 rounded-full p-1"
            />
          </div>

          {/* Liked Indicator */}
          {profile.liked && (
            <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-2">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          {/* Swipe Overlays */}
          {isDragging && (
            <>
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  isLikeDirection ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ opacity: overlayOpacity * 0.7 }}
              >
                <span className="text-white text-3xl font-bold transform rotate-12">
                  {isLikeDirection ? 'LIKE' : 'PASS'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold text-white">
                {profile.name}, {profile.age}
              </h3>
              <OnlineStatus 
                isOnline={isUserOnline(profile.id.toString())} 
                size="sm"
              />
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsAppClick}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            {profile.location}
          </div>
          
          <p className="text-gray-300 text-sm">{profile.bio}</p>
        </div>
      </Card>

      {/* Background Cards */}
      <Card className="absolute top-2 left-2 w-full h-full bg-gray-700 border-gray-600 -z-10" />
      <Card className="absolute top-4 left-4 w-full h-full bg-gray-600 border-gray-500 -z-20" />
    </div>
  );
};

export default ProfileCard;
