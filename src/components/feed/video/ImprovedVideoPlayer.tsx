
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
  className = '',
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

  // Improved event handlers with better error handling
  const handleVideoEvents = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      try {
        setDuration(video.duration || 0);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error handling loadedmetadata:', err);
      }
    };
    
    const handleTimeUpdate = () => {
      try {
        setCurrentTime(video.currentTime || 0);
      } catch (err) {
        console.error('Error handling timeupdate:', err);
      }
    };
    
    const handlePlay = () => {
      try {
        setIsPlaying(true);
        setIsBuffering(false);
        setError(null);
        resetControlsTimeout();
      } catch (err) {
        console.error('Error handling play:', err);
      }
    };
    
    const handlePause = () => {
      try {
        setIsPlaying(false);
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      } catch (err) {
        console.error('Error handling pause:', err);
      }
    };
    
    const handleWaiting = () => {
      try {
        setIsBuffering(true);
      } catch (err) {
        console.error('Error handling waiting:', err);
      }
    };
    
    const handleCanPlay = () => {
      try {
        setIsBuffering(false);
        setError(null);
      } catch (err) {
        console.error('Error handling canplay:', err);
      }
    };
    
    const handleError = (e: Event) => {
      console.error('Video error:', e);
      setError('Video failed to load');
      setIsLoading(false);
      setIsBuffering(false);
    };

    // Add all event listeners with error handling
    try {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('waiting', handleWaiting);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      return () => {
        try {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          video.removeEventListener('timeupdate', handleTimeUpdate);
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
          video.removeEventListener('waiting', handleWaiting);
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
        } catch (err) {
          console.error('Error removing event listeners:', err);
        }
      };
    } catch (err) {
      console.error('Error adding event listeners:', err);
      return () => {};
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

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        await video.pause();
      } else {
        await video.play();
      }
    } catch (err) {
      console.error('Play/pause error:', err);
      setError('Failed to play video');
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const seekTime = Math.max(0, Math.min(time, video.duration || 0));
      video.currentTime = seekTime;
      setCurrentTime(seekTime);
    } catch (err) {
      console.error('Seek error:', err);
    }
  }, []);

  const handleVolumeChangeWrapper = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      video.volume = clampedVolume;
      setVolume(clampedVolume);
    } catch (err) {
      console.error('Volume change error:', err);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.muted = !video.muted;
      setVolume(video.muted ? 0 : video.volume);
    } catch (err) {
      console.error('Mute toggle error:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await videoRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    try {
      resetControlsTimeout();
    } catch (err) {
      console.error('Mouse move error:', err);
    }
  }, [resetControlsTimeout]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    try {
      e.stopPropagation();
      resetControlsTimeout();
    } catch (err) {
      console.error('Click error:', err);
    }
  }, [resetControlsTimeout]);

  // Prevent touch events from bubbling to parent card
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    try {
      e.stopPropagation();
    } catch (err) {
      console.error('Touch start error:', err);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    try {
      e.stopPropagation();
    } catch (err) {
      console.error('Touch move error:', err);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    try {
      e.stopPropagation();
    } catch (err) {
      console.error('Touch end error:', err);
    }
  }, []);

  const memoizedVideoControls = useMemo(() => {
    if (!controls) return null;
    
    try {
      return (
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
      );
    } catch (err) {
      console.error('Error creating video controls:', err);
      return null;
    }
  }, [
    controls,
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

  if (!src || typeof src !== 'string' || src.trim() === '') {
    return (
      <div className={`bg-gray-800 flex items-center justify-center h-96 rounded-lg ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-sm">No video source provided</div>
        </div>
      </div>
    );
  }

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
        preload="metadata"
      />
      {memoizedVideoControls}
    </div>
  );
};

export default ImprovedVideoPlayer;
