
import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

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
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

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
      setError(null);
    };
    
    const handleError = () => {
      setError('Video failed to load');
      setIsLoading(false);
      setIsBuffering(false);
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

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = (clickX / rect.width) * duration;
    
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  }, [duration]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
    resetControlsTimeout();
  }, [togglePlay, resetControlsTimeout]);

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
        className="w-full h-full object-cover"
        preload="metadata"
      />

      {/* Loading/Buffering State */}
      {(isLoading || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-white text-center">
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {/* Mobile-style Controls */}
      {controls && showControls && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Fullscreen logic would go here
              }}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-auto">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-white/30 rounded-full mb-2 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-white rounded-full transition-all duration-200"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between text-white text-sm">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Center Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedVideoPlayer;
