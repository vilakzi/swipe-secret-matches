
import { Card } from "@/components/ui/card";
import { usePresence } from "@/hooks/usePresence";
import { useNavigate } from "react-router-dom";
import { useImageModal } from "@/hooks/useImageModal";
import OptimizedImage from "@/components/ui/OptimizedImage";
import ImageModal from "@/components/ui/ImageModal";
import { useState } from "react";
import PostVideoPlayer from "./PostVideoPlayer";
import PostCardHeader from "./PostCardHeader";
import PostCardActions from "./PostCardActions";
import PostCardCaption from "./PostCardCaption";
import PostComments from "./PostComments";
import { isVideo } from "@/utils/feed/mediaUtils";

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
}

interface FeedItem {
  id: string;
  type: "profile" | "post";
  profile: Profile;
  postImage?: string;
  caption?: string;
}

interface PostCardProps {
  item: FeedItem;
  likedItems: Set<string>;
  isSubscribed: boolean;
  onLike: (itemId: string, profileId: string) => void;
  onContact: (profile: Profile) => void;
}

const PostCard = ({
  item,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
}: PostCardProps) => {
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();
  const [showComments, setShowComments] = useState(false);

  const handleProfileClick = () => {
    navigate(`/profile/${item.profile.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(item.id, item.profile.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact(item.profile);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(item.profile.image, `${item.profile.name}'s profile photo`);
  };

  const handlePostImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(item.postImage || "", `${item.profile.name}'s post`);
  };

  const isVideoPost = item.postImage && isVideo(item.postImage);

  // Generate poster URL for videos
  const generatePosterUrl = (videoUrl: string) => {
    // Try common poster patterns
    const posterUrl = videoUrl.replace(/\.(mp4|mov|webm|avi|mkv)$/i, '.jpg');
    return posterUrl !== videoUrl ? posterUrl : undefined;
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4" tabIndex={0} aria-label={`Post card from ${item.profile.name}`}>
        <PostCardHeader
          profile={item.profile}
          isSubscribed={isSubscribed}
          isUserOnline={isUserOnline}
          onProfileClick={handleProfileClick}
          onAvatarClick={handleAvatarClick}
        />
        {/* Post Content */}
        <div className="relative">
          {isVideoPost && item.postImage ? (
            <PostVideoPlayer
              src={item.postImage}
              posterUrl={generatePosterUrl(item.postImage)}
            />
          ) : (
            item.postImage && (
              <OptimizedImage
                src={item.postImage}
                alt={`Post image from ${item.profile.name}`}
                className="w-full h-72 hover:opacity-95 transition-opacity"
                onClick={handlePostImageClick}
                expandable
              />
            )
          )}
          <div
            className="absolute top-4 left-4 right-4 h-8 bg-transparent cursor-pointer"
            onClick={handleProfileClick}
            tabIndex={0}
            aria-label={`Open profile for ${item.profile.name}`}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleProfileClick();
              }
            }}
          />
        </div>

        <div className="p-4">
          <PostCardActions
            itemId={item.id}
            showComments={showComments}
            onToggleComments={() => setShowComments((open) => !open)}
            onContact={handleContact}
            isSubscribed={isSubscribed}
          />
          <PostCardCaption
            name={item.profile.name}
            caption={item.caption}
            onProfileClick={handleProfileClick}
          />
          {showComments && (
            <PostComments
              postId={item.id}
              isOpen={showComments}
              onToggle={() => setShowComments((open) => !open)}
            />
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
};

export default PostCard;
