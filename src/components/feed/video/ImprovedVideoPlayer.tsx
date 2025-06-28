
import React, { useMemo, useState, useRef, useCallback } from 'react';
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

  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleVolumeChangeWrapper = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVolume(videoRef.current.muted ? 0 : 1);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

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
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        controls={controls}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        className="w-full h-full object-cover rounded-lg"
      />
      {memoizedVideoControls}
    </div>
  );
};

export default ImprovedVideoPlayer;
