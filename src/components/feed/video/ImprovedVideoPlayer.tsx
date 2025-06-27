
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
  controls?: boolean;
}

const ImprovedVideoPlayer: React.FC<ImprovedVideoPlayerProps> = ({
  src,
  poster,
  className = '',
  autoPlay = false,
  controls = false
}) => {
  const [showVideo, setShowVideo] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false); // Fix: Initialize as false

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
      // Wait for video to be ready before playing
      setTimeout(() => togglePlay(), 100);
    } else {
      await togglePlay();
    }
  };

  const handleScreenTap = (event?: React.MouseEvent | React.TouchEvent) => {
    // Don't interfere with control button clicks
    if (event && (event.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Toggle play/pause when user taps the screen area
    if (showVideo && !isLoading) {
      togglePlay();
    }
    // Also trigger the smart controls
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

  // Sync video player state with smart controls
  useEffect(() => {
    if (isPlaying) {
      handleVideoPlay();
    } else {
      handleVideoPause();
    }
  }, [isPlaying, handleVideoPlay, handleVideoPause]);

  // Handle fullscreen changes
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

  // Smart controls visibility: show when not playing, when user is interacting, or when explicitly enabled
  const controlsVisible = controls || !isPlaying || showControls || isLoading || isBuffering;

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
      
      <VideoControlsOverlay
        showControls={controlsVisible}
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
