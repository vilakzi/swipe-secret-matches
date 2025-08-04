
import * as React from 'react';
import OptimizedImage from "@/components/ui/OptimizedImage";
import PostVideoPlayer from "./PostVideoPlayer";
import VideoModal from "@/components/ui/VideoModal";
import { useVideoModal } from "@/hooks/useVideoModal";
import { isVideo } from "@/utils/feed/mediaUtils";

interface PostCardContentProps {
  postImage?: string;
  profileName: string;
  onPostImageClick: (e: React.MouseEvent) => void;
  onProfileClick: () => void;
}

const PostCardContent = ({ 
  postImage, 
  profileName, 
  onPostImageClick, 
  onProfileClick 
}: PostCardContentProps) => {
  const { isOpen, videoSrc, videoPoster, openModal, closeModal } = useVideoModal();
  
  if (!postImage) return null;

  const isVideoPost = isVideo(postImage);

  const handleVideoClick = () => {
    if (isVideoPost) {
      openModal(postImage);
    }
  };

  return (
    <>
      <div className="relative">
        {isVideoPost ? (
          <PostVideoPlayer
            src={postImage}
            className="w-full rounded-lg"
            onClick={handleVideoClick}
          />
        ) : (
          <OptimizedImage
            src={postImage}
            alt={`Post image from ${profileName}`}
            className="w-full h-96 md:h-[450px] hover:opacity-95 transition-opacity rounded-lg object-cover"
            onClick={onPostImageClick}
            expandable
            loading="lazy"
          />
        )}
        
        {/* Clickable overlay for profile navigation - only on non-video posts */}
        {!isVideoPost && (
          <div
            className="absolute top-4 left-4 right-4 h-12 bg-transparent cursor-pointer touch-target"
            onClick={onProfileClick}
            tabIndex={0}
            aria-label={`Open profile for ${profileName}`}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onProfileClick();
              }
            }}
          />
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isOpen}
        onClose={closeModal}
        videoSrc={videoSrc}
        videoPoster={videoPoster}
      />
    </>
  );
};

export default PostCardContent;
