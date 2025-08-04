
import * as React from 'react';
import { useVideoAutoPlay } from '@/hooks/useVideoAutoPlay';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import VideoControls from './VideoControls';
import VideoLoadingIndicator from './VideoLoadingIndicator';
import VideoErrorDisplay from './VideoErrorDisplay';

interface ImprovedVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  enableAutoPlayOnScroll?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
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
  enableAutoPlayOnScroll = false,
  onPlay,
  onPause,
}) => {
  const {
    videoRef,
    isPlaying,
    isBuffering,
    isLoading,
    currentTime,
    duration,
    volume,
    showControls,
    error,
    isMuted,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleSeek,
    handleMouseMove,
    handleClick,
  } = useVideoPlayer({
    src,
    autoPlay,
    controls,
    loop,
    muted,
    playsInline,
    onPlay,
    onPause,
  });
  
  // Auto-play on scroll
  useVideoAutoPlay(videoRef, { 
    threshold: 0.6,
    rootMargin: '-10% 0px'
  });

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMute();
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    handleVolumeChange(parseFloat(e.target.value));
  };

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
      className={`relative rounded-lg overflow-hidden bg-black ${className}`}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
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
        className="w-full h-full object-cover cursor-pointer"
        preload="metadata"
      />

      <VideoLoadingIndicator
        isLoading={isLoading}
        isBuffering={isBuffering}
        showPoster={false}
      />

      <VideoErrorDisplay
        videoError={error}
        src={src}
      />

      {controls && (
        <VideoControls
          showControls={showControls}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          isLoading={isLoading}
          isMuted={isMuted}
          volume={volume}
          currentTime={currentTime}
          duration={duration}
          onTogglePlay={handleTogglePlay}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeSliderChange}
          onSeek={handleSeek}
        />
      )}
    </div>
  );
};

export default ImprovedVideoPlayer;
