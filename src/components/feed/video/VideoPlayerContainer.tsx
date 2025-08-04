
import * as React from 'react';

interface VideoPlayerContainerProps {
  src: string;
  poster?: string;
  className?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  isFullscreen: boolean;
  isMuted: boolean;
  onMouseMove: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onClick: (e?: React.MouseEvent | React.TouchEvent) => void;
  children: React.ReactNode;
}

const VideoPlayerContainer: React.FC<VideoPlayerContainerProps> = ({
  src,
  poster,
  className,
  videoRef,
  isFullscreen,
  isMuted,
  onMouseMove,
  onTouchStart,
  onClick,
  children
}) => {
  const handleClick = (e: React.MouseEvent) => {
    onClick(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    onClick(e);
  };

  return (
    <div 
      className={`relative w-full ${
        isFullscreen 
          ? 'h-screen' 
          : 'aspect-video h-72'
      } bg-black rounded-lg overflow-hidden ${className}`}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        muted={isMuted}
        preload="metadata"
        autoPlay
        loop
      />
      {children}
    </div>
  );
};

export default VideoPlayerContainer;
