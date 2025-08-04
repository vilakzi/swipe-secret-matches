
import * as React from 'react';
import ImprovedVideoPlayer from './video/ImprovedVideoPlayer';
import { isVideo } from '@/utils/feed/mediaUtils';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onClick?: () => void;
}

const PostVideoPlayer: React.FC<PostVideoPlayerProps> = ({ 
  src, 
  poster, 
  className = '', 
  onClick 
}) => {
  if (!src || src.trim() === '' || !isVideo(src)) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center h-96 ${className} rounded-lg`}>
        <div className="text-center text-gray-400">
          <div className="text-sm">No video available</div>
          <div className="text-xs mt-1">Invalid video source</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative cursor-pointer ${className}`}
      onClick={onClick}
    >
      <ImprovedVideoPlayer
        src={src}
        poster={poster}
        className="w-full h-96 md:h-[450px] object-cover rounded-lg"
        autoPlay={false}
        controls={false}
        loop={true}
        muted={true}
        playsInline={true}
        enableAutoPlayOnScroll={true}
      />
      
      {/* Click overlay for expansion */}
      <div className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors rounded-lg" />
    </div>
  );
};

export default PostVideoPlayer;
