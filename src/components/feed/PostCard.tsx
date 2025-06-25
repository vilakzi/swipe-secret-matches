
import { Card } from "@/components/ui/card";
import { usePresence } from "@/hooks/usePresence";
import { useNavigate } from "react-router-dom";
import { useImageModal } from "@/hooks/useImageModal";
import ImageModal from "@/components/ui/ImageModal";
import { useState } from "react";
import PostCardHeader from "./PostCardHeader";
import PostCardActions from "./PostCardActions";
import PostCardCaption from "./PostCardCaption";
import PostComments from "./PostComments";
import PostCardDeleteMenu from "./PostCardDeleteMenu";
import PostCardContent from "./PostCardContent";
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
  onDelete?: (itemId: string) => void;
  engagementTracker?: any;
}

const PostCard = ({
  item,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onDelete,
  engagementTracker,
}: PostCardProps) => {
  const { isUserOnline } = usePresence();
  const navigate = useNavigate();
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();
  const [showComments, setShowComments] = useState(false);

  // Mobile-optimized handlers
  const handleProfileClick = () => {
    engagementTracker?.trackEngagement(item.id, 'tap');
    navigate(`/profile/${item.profile.id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'like');
    onLike(item.id, item.profile.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'contact');
    onContact(item.profile);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'tap');
    openModal(item.profile.image, `${item.profile.name}'s profile photo`);
  };

  const handlePostImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    engagementTracker?.trackEngagement(item.id, 'tap');
    openModal(item.postImage || "", `${item.profile.name}'s post`);
  };

  return (
    <>
      <PostCardEngagement itemId={item.id} engagementTracker={engagementTracker}>
        <Card 
          className="bg-gray-800 border-gray-700 mb-4 touch-target" 
          tabIndex={0} 
          aria-label={`Post card from ${item.profile.name}`}
        >
          <PostCardHeader
            profile={item.profile}
            isSubscribed={isSubscribed}
            isUserOnline={isUserOnline}
            onProfileClick={handleProfileClick}
            onAvatarClick={handleAvatarClick}
          >
            <PostCardDeleteMenu
              postId={item.id}
              profileId={item.profile.id}
              onDelete={onDelete}
            />
          </PostCardHeader>
          
          <PostCardContent
            postImage={item.postImage}
            profileName={item.profile.name}
            onPostImageClick={handlePostImageClick}
            onProfileClick={handleProfileClick}
          />

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
      </PostCardEngagement>
      
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
