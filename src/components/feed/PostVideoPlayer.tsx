
import React, { useState, useRef, useEffect } from 'react';
import ImprovedVideoPlayer from './video/ImprovedVideoPlayer';
import { isVideo } from '@/utils/feed/mediaUtils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  onClick?: () => void;
  onExpand?: () => void;
}

const PostVideoPlayer: React.FC<PostVideoPlayerProps> = ({ 
  src, 
  poster, 
  className = '', 
  onClick,
  onExpand
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.5,
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleExpand = () => {
    setIsExpanded(true);
    onExpand?.();
  };

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
      <div 
        ref={videoRef}
        className={`relative cursor-pointer ${className}`}
        onClick={onClick}
      >
        <ImprovedVideoPlayer
          src={src}
          poster={poster}
          className="w-full h-full object-cover rounded-lg"
          autoPlay={false}
          controls={true}
          loop={true}
          muted={true}
          playsInline={true}
          inView={isInView}
          expanded={isExpanded}
          onExpand={handleExpand}
        />
      </div>

      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black">
          <ImprovedVideoPlayer
            src={src}
            poster={poster}
            className="w-full aspect-video"
            autoPlay={true}
            controls={true}
            loop={true}
            muted={false}
            playsInline={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostVideoPlayer;
