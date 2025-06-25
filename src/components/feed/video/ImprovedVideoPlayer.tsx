
import React, { useState, useEffect } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useSmartVideoControls } from '@/hooks/useSmartVideoControls';
import EnhancedVideoPreview from './EnhancedVideoPreview';
import VideoPlayerContainer from './VideoPlayerContainer';
import VideoControlsOverlay from './VideoControlsOverlay';
import VideoLoadingIndicator from './VideoLoadingIndicator';
import VideoErrorDisplay from './VideoErrorDisplay';

interface ImprovedVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

const ImprovedVideoPlayer: React.FC<ImprovedVideoPlayerProps> = ({
  src,
  poster,
  className = '',
  autoPlay = false
}) => {
  const [showVideo, setShowVideo] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    videoRef,
    isPlaying,
    isLoading,
    isBuffering,
    error,
    isMuted,
    volume,
    togglePlay,
    toggleMute,
    handleVolumeChange
  } = useVideoPlayer(src);

  const {
    showControls,
    handleVideoPlay,
    handleVideoPause,
    handleMouseMove,
    handleTouchStart,
    handleClick
  } = useSmartVideoControls({
    hideDelay: 3000,
    showOnHover: true,
    showOnTouch: true
  });

  const handlePlayClick = async () => {
    if (!showVideo) {
      setShowVideo(true);
      setTimeout(() => togglePlay(), 100);
    } else {
      await togglePlay();
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Sync video player state with smart controls
  useEffect(() => {
    if (isPlaying) {
      handleVideoPlay();
    } else {
      handleVideoPause();
    }
  }, [isPlaying, handleVideoPlay, handleVideoPause]);

  if (error) {
    return <VideoErrorDisplay videoError={error} src={src} />;
  }

  if (!showVideo) {
    return (
      <EnhancedVideoPreview
        src={src}
        poster={poster}
        onPlay={handlePlayClick}
        className={className}
      />
    );
  }

  return (
    <VideoPlayerContainer
      src={src}
      poster={poster}
      className={className}
      videoRef={videoRef}
      isFullscreen={isFullscreen}
      isMuted={isMuted}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      <VideoLoadingIndicator
        isLoading={isLoading}
        isBuffering={isBuffering}
        showPoster={false}
      />
      
      <VideoControlsOverlay
        showControls={showControls}
        showVideo={showVideo}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        isMuted={isMuted}
        volume={volume}
        isFullscreen={isFullscreen}
        onPlayClick={handlePlayClick}
        onToggleMute={toggleMute}
        onVolumeChange={handleVolumeChange}
        onToggleFullscreen={toggleFullscreen}
      />
    </VideoPlayerContainer>
  );
};

export default ImprovedVideoPlayer;
