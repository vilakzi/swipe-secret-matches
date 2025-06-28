
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import VideoControls from './VideoControls';

interface ImprovedVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
}

const ImprovedVideoPlayer: React.FC<ImprovedVideoPlayerProps> = ({
  src,
  poster,
  className,
  autoPlay = false,
  controls = true,
  loop = false,
  muted = false,
  playsInline = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls when playing
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handleVideoEvents = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setIsLoading(false);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(video.currentTime);
      };
      
      const handlePlay = () => {
        setIsPlaying(true);
        setIsBuffering(false);
        resetControlsTimeout();
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
      
      const handleWaiting = () => {
        setIsBuffering(true);
      };
      
      const handleCanPlay = () => {
        setIsBuffering(false);
      };
      
      const handleError = () => {
        setError('Video failed to load');
        setIsLoading(false);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('waiting', handleWaiting);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [resetControlsTimeout]);

  useEffect(() => {
    const cleanup = handleVideoEvents();
    return cleanup;
  }, [handleVideoEvents]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setUserInteracted(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setUserInteracted(true);
    }
  }, []);

  const handleVolumeChangeWrapper = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setUserInteracted(true);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVolume(videoRef.current.muted ? 0 : 1);
      setUserInteracted(true);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
    setUserInteracted(true);
  }, [isFullscreen]);

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card swipe on video click
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  // Prevent touch events from bubbling to parent card
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
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
      isMuted={videoRef.current?.muted || volume === 0}
      showControls={showControls}
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
    <div 
      className={`relative rounded-lg overflow-hidden video-controls ${className}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        controls={false}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        className="w-full h-full object-cover rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {controls && memoizedVideoControls}
    </div>
  );
};

export default ImprovedVideoPlayer;
