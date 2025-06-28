
import React, { useState, useEffect } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useSmartVideoControls } from '@/hooks/useSmartVideoControls';
import EnhancedVideoPreview from './EnhancedVideoPreview';
import VideoPlayerContainer from './VideoPlayerContainer';
import VideoControls from './VideoControls';
import VideoLoadingIndicator from './VideoLoadingIndicator';
import VideoErrorDisplay from './VideoErrorDisplay';

interface ImprovedVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
}

const ImprovedVideoPlayer: React.FC<ImprovedVideoPlayerProps> = ({
  src,
  poster,
  className = '',
  autoPlay = true,
  controls = true
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

  const handleScreenTap = (event?: React.MouseEvent | React.TouchEvent) => {
    if (event && (event.target as HTMLElement).closest('button')) {
      return;
    }
    
    if (showVideo && !isLoading) {
      togglePlay();
    }
    handleClick();
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      handleVideoPlay();
    } else {
      handleVideoPause();
    }
  }, [isPlaying, handleVideoPlay, handleVideoPause]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      onClick={handleScreenTap}
    >
      <VideoLoadingIndicator
        isLoading={isLoading}
        isBuffering={isBuffering}
        showPoster={false}
      />
      
      <VideoControls
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        showControls={showControls || !isPlaying}
        showPoster={false}
        videoError={error}
        volume={volume}
        isMuted={isMuted}
        onPlay={handlePlayClick}
        onFullscreen={toggleFullscreen}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={toggleMute}
      />
    </VideoPlayerContainer>
  );
};

export default ImprovedVideoPlayer;
