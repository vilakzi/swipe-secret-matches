
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
}

const PostCard = ({
  item,
  likedItems,
  isSubscribed,
  onLike,
  onContact,
  onDelete,
}: PostCardProps) => {
  const { isUserOnline } = usePresence();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen, imageSrc, imageAlt, openModal, closeModal } = useImageModal();
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeletePost = async () => {
    if (!user || user.id !== item.profile.id) {
      toast({
        title: "Access denied",
        description: "You can only delete your own posts",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Remove "post-" prefix if it exists to get the actual UUID
      const actualPostId = item.id.startsWith('post-') ? item.id.replace('post-', '') : item.id;
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', actualPostId)
        .eq('provider_id', user.id); // Double check user owns the post

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Delete failed",
          description: "Could not delete the post. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Post deleted",
          description: "Your post has been successfully deleted.",
        });
        if (onDelete) {
          onDelete(item.id);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed", 
        description: "An error occurred while deleting the post.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isVideoPost = item.postImage && isVideo(item.postImage);
  const canDelete = user && user.id === item.profile.id;

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-4" tabIndex={0} aria-label={`Post card from ${item.profile.name}`}>
        <PostCardHeader
          profile={item.profile}
          isSubscribed={isSubscribed}
          isUserOnline={isUserOnline}
          onProfileClick={handleProfileClick}
          onAvatarClick={handleAvatarClick}
        >
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  className="text-red-400 hover:text-red-300 hover:bg-gray-700 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Deleting..." : "Delete Post"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </PostCardHeader>
        
        {/* Post Content */}
        <div className="relative">
          {isVideoPost && item.postImage ? (
            <PostVideoPlayer
              src={item.postImage}
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
