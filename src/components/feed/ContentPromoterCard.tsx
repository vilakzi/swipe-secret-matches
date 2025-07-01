
import React, { memo, useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useImageModal } from "@/hooks/useImageModal";
import ImageModal from "@/components/ui/ImageModal";
import PostVideoPlayer from "./PostVideoPlayer";
import { isVideo } from "@/utils/feed/mediaUtils";
import { FeedItem, Profile } from './types/feedTypes';

interface ContentPromoterCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onContentLike?: (contentId: string, profileId: string) => Promise<void>;
  onContentShare?: (contentId: string) => Promise<void>;
  showAdminBadge?: boolean;
}

const ContentPromoterCard = memo<ContentPromoterCardProps>(({
  item,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onContentLike,
  onContentShare,
  showAdminBadge = false,
}) => {
  const navigate = useNavigate();
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();
  const [showComments, setShowComments] = useState(false);

  // Safety checks
  if (!item?.id || !item?.profile) {
    console.warn('ContentPromoterCard: Invalid item data', item);
    return null;
  }

  const isLiked = likedItems.has(item.id);
  const isVideoPost = item.postImage && isVideo(item.postImage);

  const handleProfileClick = useCallback(() => {
    navigate(`/profile/${item.profile.id}`);
  }, [item.profile.id, navigate]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContentLike && item.isContent) {
      await onContentLike(item.id, item.profile.id);
    } else {
      onLike(item.id, item.profile.id);
    }
  }, [item.id, item.profile.id, item.isContent, onContentLike, onLike]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onContentShare) {
      await onContentShare(item.id);
    }
  }, [item.id, onContentShare]);

  const handleContact = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onContact(item.profile);
  }, [item.profile, onContact]);

  const handleAvatarClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(item.profile.image, `${item.profile.name}'s profile photo`);
  }, [item.profile.image, item.profile.name, openModal]);

  const handlePostImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVideoPost) {
      openModal(item.postImage || "", `${item.profile.name}'s post`);
    }
  }, [item.postImage, item.profile.name, isVideoPost, openModal]);

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4 touch-target">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img
              src={item.profile.image}
              alt={`${item.profile.name}'s avatar`}
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={handleAvatarClick}
              loading="lazy"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 
                  className="font-semibold text-white cursor-pointer hover:text-purple-400 transition-colors"
                  onClick={handleProfileClick}
                >
                  {item.profile.name}
                </h3>
              </div>
              {item.createdAt && (
                <p className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {item.type === 'post' && item.postImage && (
          <div className="relative">
            {isVideoPost ? (
              <PostVideoPlayer
                src={item.postImage}
                className="w-full rounded-lg"
              />
            ) : (
              <img
                src={item.postImage}
                alt={`Post from ${item.profile.name}`}
                className="w-full h-64 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={handlePostImageClick}
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* Profile content */}
        {item.type === 'profile' && (
          <div className="p-4">
            <div className="text-center">
              <img
                src={item.profile.image}
                alt={`${item.profile.name}'s profile`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                onClick={handleAvatarClick}
                loading="lazy"
              />
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white">{item.profile.name}</h3>
                <p className="text-sm text-gray-400">Age: {item.profile.age}</p>
                <p className="text-sm text-gray-400">{item.profile.location}</p>
                {item.profile.bio && (
                  <p className="text-sm text-gray-300 mt-2">{item.profile.bio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </Button>
              
              {onContentShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              )}
            </div>

            {isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleContact}
                className="text-white border-purple-500 hover:bg-purple-500/20"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Contact
              </Button>
            )}
          </div>

          {/* Caption */}
          {item.caption && (
            <div className="text-sm text-gray-300">
              <span className="font-medium text-white cursor-pointer" onClick={handleProfileClick}>
                {item.profile.name}
              </span>{' '}
              {item.caption}
            </div>
          )}
        </div>
      </Card>
      
      <ImageModal
        isOpen={isOpen}
        onClose={closeModal}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      />
    </>
  );
});

ContentPromoterCard.displayName = 'ContentPromoterCard';
export default ContentPromoterCard;
