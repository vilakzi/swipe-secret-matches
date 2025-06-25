
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

  // Safety checks
  if (!item || !item.id || !item.profile) {
    console.warn('PostCard: Invalid item data', item);
    return null;
  }

  console.log('🎯 PostCard rendering item:', {
    id: item.id,
    type: item.type,
    profileName: item.profile.name,
    hasPostImage: !!item.postImage,
    isVideo: item.isVideo,
    isAdmin: item.profile.role === 'admin' || item.isAdminPost
  });

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
          aria-label={`${item.type === 'post' ? 'Post' : 'Profile'} from ${item.profile.name}`}
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
          
          {/* Only show post content if it's a post type with media */}
          {item.type === 'post' && item.postImage && (
            <PostCardContent
              postImage={item.postImage}
              profileName={item.profile.name}
              onPostImageClick={handlePostImageClick}
              onProfileClick={handleProfileClick}
            />
          )}

          {/* Show profile content for profile type items */}
          {item.type === 'profile' && (
            <div className="p-4">
              <div className="text-center">
                <img
                  src={item.profile.image}
                  alt={`${item.profile.name}'s profile`}
                  className="w-full h-72 object-cover rounded-lg cursor-pointer"
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

          <div className="p-4">
            <PostCardActions
              itemId={item.id}
              showComments={showComments}
              onToggleComments={() => setShowComments((open) => !open)}
              onContact={handleContact}
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
