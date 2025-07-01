
import React, { useState, useCallback } from 'react';
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

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  }, []);

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
    <>
      <div className={`relative ${className}`}>
        <ImprovedVideoPlayer
          src={src}
          poster={poster}
          className="w-full h-96 md:h-[450px] object-contain"
          autoPlay={false}
          controls={true}
          loop={true}
          muted={true}
          playsInline={true}
        />
        <Button
          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white border-white/20 z-30"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          aria-label="Toggle fullscreen"
        >
          <Maximize2 size={16} />
        </Button>
      </div>
      
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
            <ImprovedVideoPlayer
              src={src}
              poster={poster}
              className="w-full h-full max-h-full object-contain"
              autoPlay={false}
              controls={true}
              loop={true}
              muted={false}
              playsInline={true}
            />
            <Button
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white border-white/20 z-30"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand();
              }}
              aria-label="Exit fullscreen"
            >
              <Minimize2 size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PostVideoPlayer;
