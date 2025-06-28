
import React, { useState } from 'react';
import ImprovedVideoPlayer from './video/ImprovedVideoPlayer';
import { isVideo } from '@/utils/feed/mediaUtils';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

const PostVideoPlayer: React.FC<PostVideoPlayerProps> = ({ src, poster, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!src || src.trim() === '' || !isVideo(src)) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center h-96 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-sm">No video available</div>
        </div>
      </div>
    );
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`relative ${isExpanded ? 'fixed inset-6 z-50 bg-black/90 rounded-lg backdrop-blur-sm' : ''}`}>
      <ImprovedVideoPlayer
        src={src}
        poster={poster}
        className={`w-full ${isExpanded ? 'h-full max-h-[85vh] max-w-[90vw] mx-auto' : 'h-96 md:h-[450px]'} object-contain ${className}`}
        autoPlay={false}
        controls={true}
        loop={true}
        muted={true}
        playsInline={true}
      />
      <Button
        className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white border-white/20 z-20"
        size="sm"
        onClick={toggleExpand}
      >
        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </Button>
      
      {isExpanded && (
        <div 
          className="absolute inset-0 bg-black/50 -z-10"
          onClick={toggleExpand}
        />
      )}
    </div>
  );
};

export default PostVideoPlayer;
