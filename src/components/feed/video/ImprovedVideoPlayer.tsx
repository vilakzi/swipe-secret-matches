
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

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

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(error => console.error("Autoplay failed:", error));
    }
  }, [autoPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDuration = () => setDuration(video.duration);
    video.addEventListener('loadedmetadata', updateDuration);
    return () => video.removeEventListener('loadedmetadata', updateDuration);
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleTouchStart = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleScreenTap = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

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
      videoRef.current?.requestFullscreen();
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
      showPoster={false}
      videoError={error}
      onPlay={togglePlay}
      onPlayPause={togglePlay}
      onSeek={handleSeek}
      onVolumeChange={handleVolumeChangeWrapper}
      onToggleMute={handleToggleMute}
      onToggleFullscreen={toggleFullscreen}
    />
  ), [isPlaying, isBuffering, isLoading, isFullscreen, currentTime, duration, volume, showControls, error, togglePlay, handleSeek, handleVolumeChangeWrapper, handleToggleMute, toggleFullscreen]);

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
        showPoster={false}
      />
      {memoizedVideoControls}
    </VideoPlayerContainer>
  );
};

export default React.memo(ImprovedVideoPlayer);
