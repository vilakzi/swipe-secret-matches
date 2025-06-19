import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Heart, X, Star } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';
import ProfileImage from '@/components/profile/ProfileImage';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ActionButtons from '@/components/profile/ActionButtons';

interface SwipeCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    image: string;
    bio: string;
    location: string;
    interests?: string[];
  };
  onSwipe: (direction: 'left' | 'right', isSuperLike?: boolean) => void;
  onTap?: () => void;
  disabled?: boolean;
}

const SwipeCard = React.memo(({ profile, onSwipe, onTap, disabled = false }: SwipeCardProps) => {
  const { isUserOnline } = usePresence();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  }, [disabled]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  }, [isDragging, disabled]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || disabled) return;
    setIsDragging(false);
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      onSwipe(dragOffset.x > 0 ? 'right' : 'left');
    } else if (onTap && Math.abs(dragOffset.x) < 10 && Math.abs(dragOffset.y) < 10) {
      onTap();
    }
    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
  }, [isDragging, disabled, dragOffset.x, dragOffset.y, onSwipe, onTap]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowLeft') onSwipe('left');
    if (e.key === 'ArrowRight') onSwipe('right');
    if (e.key === 'Enter' && onTap) onTap();
  }, [disabled, onSwipe, onTap]);

  const cardStyle = {
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'all 0.3s ease-out',
    opacity: disabled ? 0.6 : 1,
  };

  const overlayOpacity = Math.min(Math.abs(dragOffset.x) / 100, 1);
  const isLikeDirection = dragOffset.x > 0;

  if (!profile) return null;

  return (
    <div className="relative w-80 h-96 mx-auto select-none">
      <Card
        ref={cardRef}
        className="w-full h-full bg-gray-800 border-gray-700 overflow-hidden cursor-grab active:cursor-grabbing relative focus:outline-none focus:ring-4 focus:ring-purple-600"
        style={cardStyle}
        tabIndex={0}
        aria-label={`Swipe card for ${profile.name}, ${profile.age}, ${profile.location}.`}
        role="article"
        onKeyDown={handleKeyDown}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Profile Image & Drag Overlays */}
        <ProfileImage
          image={profile.image}
          name={profile.name}
          isOnline={isUserOnline(profile.id)}
          alt={`${profile.name}'s profile photo`}
        >
          {isDragging && (
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
        {/* Profile Info */}
        <ProfileInfo
          name={profile.name}
          age={profile.age}
          location={profile.location}
          bio={profile.bio}
          interests={profile.interests}
          isOnline={isUserOnline(profile.id)}
          lineClampBio={2}
        />
        {/* Action Buttons */}
        <ActionButtons
          onLike={e => {
            e.stopPropagation();
            onSwipe('right');
          }}
          onPass={e => {
            e.stopPropagation();
            onSwipe('left');
          }}
          onSuperLike={e => {
            e.stopPropagation();
            onSwipe('right', true);
          }}
          showPass
          showSuperLike
          showLike
        />
      </Card>
      {/* Background Cards */}
      <Card className="absolute top-2 left-2 w-full h-full bg-gray-700 border-gray-600 -z-10" aria-hidden="true" />
      <Card className="absolute top-4 left-4 w-full h-full bg-gray-600 border-gray-500 -z-20" aria-hidden="true" />
    </div>
  );
});
SwipeCard.displayName = 'SwipeCard';
export default SwipeCard;
