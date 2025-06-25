
import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import SimpleVideoPreview from './SimpleVideoPreview';

interface ImprovedVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
}

const ImprovedVideoPlayer: React.FC<ImprovedVideoPlayerProps> = ({
  src,
  poster,
  className = '',
  autoPlay = false
}) => {
  const [showVideo, setShowVideo] = useState(autoPlay);
  const [showControls, setShowControls] = useState(true);
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

  const handlePlayClick = () => {
    if (!showVideo) {
      setShowVideo(true);
      // Small delay to ensure video element is ready
      setTimeout(() => togglePlay(), 100);
    } else {
      togglePlay();
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Hide controls after 3 seconds of inactivity during playback
  React.useEffect(() => {
    if (!isPlaying || !showVideo) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showVideo, showControls]);

  if (error) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center h-72 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-sm">Video unavailable</div>
          <div className="text-xs mt-1">Please try again later</div>
        </div>
      </div>
    );
  }

  if (!showVideo) {
    return (
      <SimpleVideoPreview
        src={src}
        poster={poster}
        onPlay={handlePlayClick}
        className={className}
      />
    );
  }

  return (
    <div 
      className={`relative bg-black overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        className={`w-full h-72 ${isFullscreen ? 'object-contain' : 'object-cover'} cursor-pointer`}
        onClick={handlePlayClick}
        poster={poster}
        preload="metadata"
        playsInline
        muted={isMuted}
        loop
      />
      
      {/* Loading indicator */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Controls overlay */}
      {showControls && showVideo && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          {/* Center play/pause button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlayClick}
              className="text-white hover:bg-white/20 bg-black/30 rounded-full p-4"
              disabled={isBuffering}
            >
              {isBuffering ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>
          
          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedVideoPlayer;
