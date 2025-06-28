
import React, { useState, useRef, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Heart, Lock } from 'lucide-react';
import OnlineStatus from './OnlineStatus';
import { usePresence } from '@/hooks/usePresence';
import ProfileImage from '@/components/profile/ProfileImage';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ActionButtons from '@/components/profile/ActionButtons';
import { Profile } from '@/components/feed/types/feedTypes';

interface ProfileCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onNavigate?: () => Promise<boolean>;
  disabled?: boolean;
  isSubscribed?: boolean;
}

const ProfileCard = memo<ProfileCardProps>(({ 
  profile, 
  onSwipe, 
  onNavigate, 
  disabled = false, 
  isSubscribed = false 
}) => {
  const { isUserOnline } = usePresence();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef<number>(0);

  // Enhanced handlers with better touch detection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    
    // Don't start drag on video elements or interactive controls
    const target = e.target as HTMLElement;
    if (target.closest('video, button, .video-controls, [role="button"]')) {
      return;
    }
    
    setIsDragging(true);
    dragStartTime.current = Date.now();
    startPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, [disabled]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    // Don't start drag on video elements or interactive controls
    const target = e.target as HTMLElement;
    if (target.closest('video, button, .video-controls, [role="button"]')) {
      return;
    }
    
    setIsDragging(true);
    dragStartTime.current = Date.now();
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  }, [disabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    // Only update if drag is significant enough
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setDragOffset({ x: deltaX, y: deltaY });
      setRotation(deltaX * 0.05); // Reduced rotation sensitivity
    }
  }, [isDragging, disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    // Only update if drag is significant enough
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      setDragOffset({ x: deltaX, y: deltaY });
      setRotation(deltaX * 0.05); // Reduced rotation sensitivity
    }
  }, [isDragging, disabled]);

  const handleEnd = useCallback(async () => {
    if (!isDragging || disabled) return;
    
    setIsDragging(false);
    const dragDuration = Date.now() - dragStartTime.current;
    const threshold = 120; // Increased threshold for more intentional swipes
    const minDragTime = 100; // Minimum drag time to prevent accidental swipes
    
    // Only trigger swipe if drag was intentional (sufficient distance, time, and horizontal movement)
    if (Math.abs(dragOffset.x) > threshold && 
        dragDuration > minDragTime && 
        Math.abs(dragOffset.x) > Math.abs(dragOffset.y) * 1.5) { // More horizontal than vertical
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else if (onNavigate && Math.abs(dragOffset.x) < 20 && Math.abs(dragOffset.y) < 20) {
      await onNavigate();
    }
    
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
  }, [isDragging, disabled, dragOffset.x, dragOffset.y, onSwipe, onNavigate]);

  const handleWhatsAppClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isSubscribed) {
      onSwipe('right');
      return;
    }
    const message = encodeURIComponent(`Hi ${profile.name}! I saw your profile and would love to chat.`);
    window.open(`https://wa.me/${profile.whatsapp.replace('+', '')}?text=${message}`, '_blank');
  }, [isSubscribed, onSwipe, profile.name, profile.whatsapp]);

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSwipe('right');
  }, [onSwipe]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowLeft') onSwipe('left');
    if (e.key === 'ArrowRight') onSwipe('right');
    if (e.key === 'Enter' && onNavigate) onNavigate();
  }, [disabled, onSwipe, onNavigate]);

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'all 0.3s ease-out',
    opacity: disabled ? 0.6 : 1,
  };

  const overlayOpacity = Math.min(Math.abs(dragOffset.x) / 120, 1);
  const isLikeDirection = dragOffset.x > 0;

  return (
    <div className="relative w-80 h-96 mx-auto select-none">
      <Card
        ref={cardRef}
        className={`w-full h-full bg-gray-800 border-gray-700 overflow-hidden cursor-grab active:cursor-grabbing relative ${
          profile.liked ? 'ring-2 ring-pink-500' : ''
        } focus:outline-none focus:ring-4 focus:ring-purple-600`}
        style={cardStyle}
        tabIndex={0}
        aria-label={`Profile card for ${profile.name}, age ${profile.age}, location ${profile.location}`}
        role="article"
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
      >
        <ProfileImage
          image={profile.image}
          name={profile.name}
          isOnline={isUserOnline(profile.id.toString())}
          liked={profile.liked}
          locked={!isSubscribed}
          alt={`${profile.name}'s profile photo`}
        >
          {!isSubscribed && (
            <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-2" aria-label="Locked, subscription required">
              <Lock className="w-4 h-4 text-white" />
            </div>
          )}
          {profile.liked && (
            <div className="absolute bottom-2 right-2 bg-pink-500 rounded-full p-2" aria-label="You liked this profile">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
          )}
          {isDragging && Math.abs(dragOffset.x) > 60 && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                isLikeDirection ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ opacity: overlayOpacity * 0.7 }}
              aria-label={isLikeDirection ? 'Liking profile' : 'Passing profile'}
            >
              <span className="text-white text-3xl font-bold transform rotate-12">
                {isLikeDirection ? 'LIKE' : 'PASS'}
              </span>
            </div>
          )}
        </ProfileImage>
        
        <ProfileInfo
          name={profile.name}
          age={profile.age}
          location={profile.location}
          bio={profile.bio}
          isOnline={isUserOnline(profile.id.toString())}
          lineClampBio={0}
        />
        
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className={`${isSubscribed ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-600 hover:bg-gray-700'} text-white border-none focus:ring-2 focus:ring-purple-400`}
            onClick={handleLikeClick}
            aria-label="Like profile"
          >
            <Heart className="w-4 h-4 mr-1" aria-hidden="true" />
            {isSubscribed ? 'Like' : <Lock className="w-3 h-3" aria-hidden="true" />}
          </Button>
          <Button
            size="sm"
            className={`${isSubscribed ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white focus:ring-2 focus:ring-green-400`}
            onClick={handleWhatsAppClick}
            aria-label="Contact on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
            {isSubscribed ? 'Chat' : <Lock className="w-3 h-3" aria-hidden="true" />}
          </Button>
        </div>
      </Card>
      {/* Background Cards */}
      <Card className="absolute top-2 left-2 w-full h-full bg-gray-700 border-gray-600 -z-10" aria-hidden="true" />
      <Card className="absolute top-4 left-4 w-full h-full bg-gray-600 border-gray-500 -z-20" aria-hidden="true" />
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';
export default ProfileCard;
