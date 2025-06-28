
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
      <div className={`bg-gray-800 flex items-center justify-center h-80 ${className}`}>
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
    <div className={`relative ${isExpanded ? 'fixed inset-4 z-50 bg-black rounded-lg' : ''}`}>
      <ImprovedVideoPlayer
        src={src}
        poster={poster}
        className={`w-full ${isExpanded ? 'h-full max-h-[80vh]' : 'h-80 md:h-96'} object-contain ${className}`}
        autoPlay={false}
        controls={true}
        loop={true}
        muted={true}
        playsInline={true}
      />
      <Button
        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-none z-10"
        size="sm"
        onClick={toggleExpand}
      >
        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </Button>
    </div>
  );
};

export default PostVideoPlayer;
