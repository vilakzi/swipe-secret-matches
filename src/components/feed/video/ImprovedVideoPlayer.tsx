import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import VideoPlayerContainer from './VideoPlayerContainer';
import VideoLoadingIndicator from './VideoLoadingIndicator';
import VideoControls from './VideoControls';

interface ImprovedVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

const ImprovedVideoPlayer: React.FC<ImprovedVideoPlayerProps> = ({
  src,
  poster,
  className = '',
  autoPlay = false,
  loop = true,
  muted = true,
  playsInline = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 1);

  const {
    isPlaying,
    isLoading,
    isBuffering,
    error,
    togglePlay,
    toggleMute,
    handleVolumeChange
  } = useVideoPlayer(videoRef, src, {
    loop,
    muted,
    playsInline
  });

  // Handle video metadata loading and time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      
      // Only attempt autoplay if explicitly requested
      if (autoPlay) {
        video.play().catch(error => {
          console.error("Autoplay failed:", error);
          // Many browsers block autoplay - don't treat this as a fatal error
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    // Listen for fullscreen change events from browser
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      
      // Clear any pending timeouts when unmounting
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [autoPlay, src]); // Re-run if src or autoPlay changes

  // Auto-hide controls after inactivity
  const hideControlsAfterDelay = useCallback(() => {
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Only auto-hide if video is playing
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    hideControlsAfterDelay();
  }, [hideControlsAfterDelay]);

  const handleTouchStart = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const handleScreenTap = useCallback((e: React.MouseEvent) => {
    // Prevent default to avoid unexpected behavior
    e.preventDefault();
    
    // Toggle play/pause
    togglePlay();
    
    // Show controls briefly when tapping
    setShowControls(true);
    hideControlsAfterDelay();
  }, [togglePlay, hideControlsAfterDelay]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChangeWrapper = useCallback((newVolume: number) => {
    setVolume(newVolume);
    handleVolumeChange(newVolume);
  }, [handleVolumeChange]);

  const handleToggleMute = useCallback(() => {
    toggleMute();
    setVolume(prev => prev === 0 ? 1 : 0);
  }, [toggleMute]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const memoizedVideoControls = useMemo(() => (
    <VideoControls
      isPlaying={isPlaying}
      isBuffering={isBuffering}
      isLoading={isLoading}
      isFullscreen={isFullscreen}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      isMuted={volume === 0}
      showControls={showControls || !isPlaying}
      showPoster={!isPlaying && currentTime === 0}
      videoError={error}
      onPlay={togglePlay}
      onPlayPause={togglePlay}
      onSeek={handleSeek}
      onVolumeChange={handleVolumeChangeWrapper}
      onMuteToggle={handleToggleMute}
      onFullscreen={toggleFullscreen}
    />
  ), [
    isPlaying, 
    isBuffering, 
    isLoading, 
    isFullscreen, 
    currentTime, 
    duration, 
    volume, 
    showControls, 
    error, 
    togglePlay, 
    handleSeek, 
    handleVolumeChangeWrapper, 
    handleToggleMute, 
    toggleFullscreen
  ]);

  return (
    <VideoPlayerContainer
      src={src}
      poster={poster}
      className={className}
      videoRef={videoRef}
      isFullscreen={isFullscreen}
      isMuted={volume === 0}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onClick={handleScreenTap}
    >
      <VideoLoadingIndicator
        isLoading={isLoading}
        isBuffering={isBuffering}
        showPoster={!isPlaying && currentTime === 0}
      />
      {memoizedVideoControls}
    </VideoPlayerContainer>
  );
};

export default React.memo(ImprovedVideoPlayer);