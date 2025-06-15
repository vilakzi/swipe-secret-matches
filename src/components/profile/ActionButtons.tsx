
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, X, Star, MessageCircle, Lock } from 'lucide-react';

interface ActionButtonsProps {
  isSubscribed?: boolean;
  onLike?: (e: React.MouseEvent) => void;
  onPass?: (e: React.MouseEvent) => void;
  onSuperLike?: (e: React.MouseEvent) => void;
  onContact?: (e: React.MouseEvent) => void;
  showPass?: boolean;
  showSuperLike?: boolean;
  showLike?: boolean;
  showContact?: boolean;
  liked?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isSubscribed,
  onLike,
  onPass,
  onSuperLike,
  onContact,
  showPass = true,
  showSuperLike = true,
  showLike = true,
  showContact = false,
  liked = false,
}) => (
  <div className="absolute bottom-4 right-4 flex space-x-2">
    {showPass && (
      <Button
        size="sm"
        variant="outline"
        className="bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600 focus:ring-2 focus:ring-red-400"
        onClick={onPass}
        aria-label="Pass profile"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </Button>
    )}
    {showSuperLike && (
      <Button
        size="sm"
        variant="outline"
        className="bg-yellow-600/20 border-yellow-500 text-yellow-400 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400"
        onClick={onSuperLike}
        aria-label="Super Like profile"
      >
        <Star className="w-4 h-4" aria-hidden="true" />
      </Button>
    )}
    {showLike && (
      <Button
        size="sm"
        variant="outline"
        className="bg-green-600/20 border-green-500 text-green-400 hover:bg-green-600 focus:ring-2 focus:ring-green-400"
        onClick={onLike}
        aria-label="Like profile"
      >
        <Heart className="w-4 h-4" aria-hidden="true" />
      </Button>
    )}
    {showContact && (
      <Button
        size="sm"
        className={`${
          isSubscribed
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-600 hover:bg-gray-700'
        } text-white focus:ring-2 focus:ring-green-400`}
        onClick={onContact}
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 mr-1" aria-hidden="true" />
        {isSubscribed ? 'Chat' : <Lock className="w-3 h-3" aria-hidden="true" />}
      </Button>
    )}
  </div>
);

export default ActionButtons;
