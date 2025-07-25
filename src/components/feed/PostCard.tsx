
import React, { memo, useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { usePresence } from "@/hooks/usePresence";
import { useNavigate } from "react-router-dom";
import { useImageModal } from "@/hooks/useImageModal";
import ImageModal from "@/components/ui/ImageModal";
import PostCardHeader from "./PostCardHeader";
import PostCardActions from "./PostCardActions";
import PostCardCaption from "./PostCardCaption";
import PostComments from "./PostComments";
import PostCardDeleteMenu from "./PostCardDeleteMenu";
import PostCardContent from "./PostCardContent";
import { isVideo } from "@/utils/feed/mediaUtils";
import PostCardEngagement from "./PostCardEngagement";

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  whatsapp: string;
  location: string;
  gender?: "male" | "female";
  liked?: boolean;
  posts?: string[];
  isRealAccount?: boolean;
  userType?: string;
  role?: string;
}

interface FeedItem {
  id: string;
  type: "profile" | "post";
  profile: Profile;
  postImage?: string;
  caption?: string;
  isAdminCard?: boolean;
  isAdminPost?: boolean;
  isVideo?: boolean;
  createdAt?: string;
}

interface PostCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
  onDelete?: (itemId: string) => void;
  engagementTracker?: any;
}

const PostCard = memo<PostCardProps>(({
  item,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onDelete,
  engagementTracker,
}) => {
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();
  const [showComments, setShowComments] = useState(false);

  // Safety checks
  if (!item?.id || !item?.profile) {
    console.warn('PostCard: Invalid item data', item);
    return null;
  }

  // Memoized handlers
  const handleProfileClick = useCallback(() => {
    engagementTracker?.trackEngagement(item.id, 'tap');
    navigate(`/profile/${item.profile.id}`);
  }, [engagementTracker, item.id, item.profile.id, navigate]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'like');
    onLike(item.id, item.profile.id);
  }, [engagementTracker, item.id, item.profile.id, onLike]);

  const handleContact = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'contact');
    onContact(item.profile);
  }, [engagementTracker, item.id, item.profile, onContact]);

  const handleAvatarClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'tap');
    openModal(item.profile.image, `${item.profile.name}'s profile photo`);
  }, [engagementTracker, item.id, item.profile.image, item.profile.name, openModal]);

  const handlePostImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'tap');
    openModal(item.postImage || "", `${item.profile.name}'s post`);
  }, [engagementTracker, item.id, item.postImage, item.profile.name, openModal]);

  const handleToggleComments = useCallback(() => {
    setShowComments(prev => !prev);
  }, []);

  // Check if this is a video post
  const isVideoPost = item.type === 'post' && item.postImage && isVideo(item.postImage);

  return (
    <>
      <PostCardEngagement itemId={item.id} engagementTracker={engagementTracker}>
        <Card 
          className="bg-gray-800 border-gray-700 mb-4 touch-target" 
          tabIndex={0} 
          aria-label={`${item.type === 'post' ? 'Post' : 'Profile'} from ${item.profile.name}`}
        >
          <PostCardHeader
            profile={item.profile}
            isSubscribed={isSubscribed}
            isUserOnline={isUserOnline}
            onProfileClick={handleProfileClick}
            onAvatarClick={handleAvatarClick}
            isVideoPost={isVideoPost}
          >
            <PostCardDeleteMenu
              postId={item.id}
              profileId={item.profile.id}
              onDelete={onDelete}
            />
          </PostCardHeader>
          
          {/* Post content */}
          {item.type === 'post' && item.postImage && (
            <PostCardContent
              postImage={item.postImage}
              profileName={item.profile.name}
              onPostImageClick={handlePostImageClick}
              onProfileClick={handleProfileClick}
            />
          )}


          <div className="p-4">
          <PostCardActions
            itemId={item.id}
            showComments={showComments}
            onToggleComments={handleToggleComments}
            onContact={() => {}} // Remove contact functionality for Instagram-style
            isSubscribed={isSubscribed}
          />
            {item.caption && (
              <PostCardCaption
                name={item.profile.name}
                caption={item.caption}
                onProfileClick={handleProfileClick}
              />
            )}
            {showComments && (
              <PostComments
                postId={item.id}
                isOpen={showComments}
                onToggle={handleToggleComments}
              />
            )}
          </div>
        </Card>
      </PostCardEngagement>
      
      <ImageModal
        isOpen={isOpen}
        onClose={closeModal}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      />
    </>
  );
});

PostCard.displayName = 'PostCard';
export default PostCard;
