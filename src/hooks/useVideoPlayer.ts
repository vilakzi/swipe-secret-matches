
import { useState, useEffect, useCallback, RefObject } from 'react';

export const useVideoPlayer = (
  videoRef: RefObject<HTMLVideoElement>,
  src: string,
  options: { loop?: boolean; muted?: boolean; playsInline?: boolean }
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const resetVideo = useCallback(() => {
    setIsPlaying(false);
    setIsLoading(true);
    setIsBuffering(false);
    setError(null);
    setDuration(0);
    setCurrentTime(0);
  }, []);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || error) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        setIsBuffering(true);
        await video.play();
        setIsPlaying(true);
        setIsBuffering(false);
      }
    } catch (err) {
      console.error('Video play error:', err);
      setError('Failed to play video');
      setIsBuffering(false);
      setIsPlaying(false);
    }
  }, [isPlaying, error]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  }, [isMuted]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = src;
    video.loop = options.loop ?? false;
    video.muted = options.muted ?? false;
    video.playsInline = options.playsInline ?? true;

    const handleLoadStart = () => {
      console.log('Video load started for:', src);
      setIsLoading(true);
      setError(null);
    };

    const handleCanPlay = () => {
      console.log('Video can play:', src);
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded:', src, 'duration:', video.duration);
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => {
      console.log('Video playing:', src);
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const handlePause = () => {
      console.log('Video paused:', src);
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      console.log('Video waiting/buffering:', src);
      setIsBuffering(true);
    };

    const handleCanPlayThrough = () => {
      console.log('Video can play through:', src);
      setIsBuffering(false);
    };

    const handleError = (e: Event) => {
      console.error('Video error for src:', src, e);
      setError('Video failed to load');
      setIsLoading(false);
      setIsBuffering(false);
      setIsPlaying(false);
    };

    const handleEnded = () => {
      console.log('Video ended:', src);
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef, src, options]);

  // Reset when src changes
  useEffect(() => {
    resetVideo();
  }, [src, resetVideo]);

  return {
    videoRef,
    isPlaying,
    isLoading,
    isBuffering,
    error,
    duration,
    currentTime,
    isMuted,
    volume,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    resetVideo
  };
};
