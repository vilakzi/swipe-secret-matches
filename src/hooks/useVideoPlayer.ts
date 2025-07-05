import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVideoPlayerOptions {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export const useVideoPlayer = ({
  src,
  autoPlay = false,
  loop = false,
  muted = false,
  playsInline = true,
  controls = true,
  onPlay,
  onPause,
}: UseVideoPlayerOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(muted);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls when playing
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (isPlaying && controls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, controls]);

  // Event handlers
  const handleVideoEvents = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsLoading(false);
      setError(null);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      setError(null);
      resetControlsTimeout();
      onPlay?.();
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      onPause?.();
    };
    
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    
    const handleCanPlay = () => {
      setIsBuffering(false);
      setError(null);
    };
    
    const handleError = () => {
      setError('Video failed to load');
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [resetControlsTimeout, onPlay, onPause]);

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

  // Control functions
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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = (clickX / rect.width) * duration;
    
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  }, [duration]);

  const handleMouseMove = useCallback(() => {
    if (controls) {
      resetControlsTimeout();
    }
  }, [resetControlsTimeout, controls]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
    if (controls) {
      resetControlsTimeout();
    }
  }, [togglePlay, resetControlsTimeout, controls]);

  return {
    videoRef,
    // State
    isPlaying,
    isBuffering,
    isLoading,
    currentTime,
    duration,
    volume,
    showControls,
    error,
    isMuted,
    // Handlers
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleSeek,
    handleMouseMove,
    handleClick,
    resetControlsTimeout,
  };
};