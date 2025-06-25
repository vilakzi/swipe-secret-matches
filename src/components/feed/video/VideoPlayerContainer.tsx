
import React, { useState } from 'react';

interface VideoPlayerContainerProps {
  src: string;
  poster?: string;
  className?: string;
  videoRef: React.RefObject<HTMLVideoElement>;
  isFullscreen: boolean;
  isMuted: boolean;
  onMouseMove: () => void;
  onTouchStart: () => void;
  onClick: () => void;
  children: React.ReactNode;
}

const VideoPlayerContainer: React.FC<VideoPlayerContainerProps> = ({
  src,
  poster,
  className = '',
  videoRef,
  isFullscreen,
  isMuted,
  onMouseMove,
  onTouchStart,
  onClick,
  children
}) => {
  return (
    <div 
      className={`relative bg-black overflow-hidden h-72 ${className}`}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onClick={onClick}
    >
      <video
        ref={videoRef}
        src={src}
        className={`w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
        poster={poster}
        preload="metadata"
        playsInline
        muted={isMuted}
        loop
      />
      {children}
    </div>
  );
};

export default VideoPlayerContainer;
