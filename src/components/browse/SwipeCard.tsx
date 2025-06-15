import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, MessageCircle, Heart, X, Star } from 'lucide-react';
import OnlineStatus from '@/components/OnlineStatus';
import { usePresence } from '@/hooks/usePresence';

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

const SwipeCard = ({ profile, onSwipe, onTap, disabled = false }: SwipeCardProps) => {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || disabled) return;
    
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(deltaX * 0.1);
  };

  const handleMouseUp = () => {
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
        className="w-full h-full bg-gray-800 border-gray-700 overflow-hidden cursor-grab active:cursor-grabbing relative focus:outline-none focus:ring-4 focus:ring-purple-600"
        style={cardStyle}
        tabIndex={0}
        aria-label={`Swipe card for ${profile.name}, ${profile.age}, ${profile.location}.`}
        role="article"
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'ArrowLeft') onSwipe('left');
          if (e.key === 'ArrowRight') onSwipe('right');
          if (e.key === 'Enter' && onTap) onTap();
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Profile Image */}
        <div 
          className="w-full h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${profile.image})` }}
          role="img"
          aria-label={`${profile.name}'s profile photo`}
        >
          {/* Online Status */}
          <div className="absolute top-2 left-2">
            <OnlineStatus 
              isOnline={isUserOnline(profile.id)} 
              size="md"
              className="bg-gray-900/50 rounded-full p-1"
            />
          </div>

          {/* Swipe Overlays */}
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
        </div>

        {/* Profile Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {profile.name}, {profile.age}
            </h3>
            <OnlineStatus isOnline={isUserOnline(profile.id)} size="sm" />
          </div>
          
          <div className="flex items-center text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
            {profile.location}
          </div>
          
          <p className="text-gray-300 text-sm line-clamp-2">{profile.bio}</p>
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600 focus:ring-2 focus:ring-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('left');
            }}
            aria-label="Pass profile"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-yellow-600/20 border-yellow-500 text-yellow-400 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('right', true);
            }}
            aria-label="Super Like profile"
          >
            <Star className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600 focus:ring-2 focus:ring-green-400"
            onClick={(e) => {
              e.stopPropagation();
              onSwipe('right');
            }}
            aria-label="Like profile"
          >
            <Heart className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </Card>

      {/* Background Cards */}
      <Card className="absolute top-2 left-2 w-full h-full bg-gray-700 border-gray-600 -z-10" aria-hidden="true" />
      <Card className="absolute top-4 left-4 w-full h-full bg-gray-600 border-gray-500 -z-20" aria-hidden="true" />
    </div>
  );
};

export default SwipeCard;
