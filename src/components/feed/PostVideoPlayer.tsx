
import React from 'react';
import ImprovedVideoPlayer from './video/ImprovedVideoPlayer';
import EnhancedVideoPreview from './video/EnhancedVideoPreview';
import { isVideo } from '@/utils/feed/mediaUtils';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  duration?: number;
}

const PostVideoPlayer = ({ src, poster, className = '', duration }: PostVideoPlayerProps) => {
  // Validate video source
  if (!src || src.trim() === '' || !isVideo(src)) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center h-72 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-sm">No video available</div>
        </div>
      </div>
    );
  }

  return (
    <ImprovedVideoPlayer
      src={src}
      poster={poster}
      className={className}
    />
  );
};

export default PostVideoPlayer;
