
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

  const isVideo =
    item.postImage?.includes(".mp4") ||
    item.postImage?.includes(".mov") ||
    item.postImage?.includes(".webm");

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4">
        <PostCardHeader
          profile={item.profile}
          isSubscribed={isSubscribed}
          isUserOnline={isUserOnline}
          onProfileClick={handleProfileClick}
          onAvatarClick={handleAvatarClick}
        />
        {/* Post Content */}
        <div className="relative">
          {isVideo && item.postImage ? (
            <PostVideoPlayer
              src={item.postImage}
              posterUrl={item.postImage.replace(/\.(mp4|mov|webm)$/, ".jpg")}
            />
          ) : (
            item.postImage && (
              <OptimizedImage
                src={item.postImage}
                alt="Post"
                className="w-full h-72 hover:opacity-95 transition-opacity"
                onClick={handlePostImageClick}
                expandable
              />
            )
          )}
          <div
            className="absolute top-4 left-4 right-4 h-8 bg-transparent cursor-pointer"
            onClick={handleProfileClick}
          />
        </div>

        <div className="p-4">
          <PostCardActions
            itemId={item.id}
            liked={likedItems.has(item.id)}
            onLike={handleLike}
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
