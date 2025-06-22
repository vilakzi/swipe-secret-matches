
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Maximize, Minimize } from 'lucide-react';

interface PostVideoPlayerProps {
  src: string;
  posterUrl?: string;
}

const PostVideoPlayer: React.FC<PostVideoPlayerProps> = ({ src, posterUrl }) => {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("[PostVideoPlayer] src:", src, "posterUrl:", posterUrl);

  // Generate a fallback poster from the video URL or use a placeholder
  const effectivePosterUrl = posterUrl || 
    src.replace(/\.(mp4|mov|webm|avi|mkv)$/i, '.jpg') || 
    `https://picsum.photos/400/600?random=${Math.floor(Math.random() * 1000)}`;

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          setIsBuffering(true);
          setShowPoster(false);
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('[PostVideoPlayer] Play error:', error);
        setVideoError('Failed to play video');
        setShowPoster(true);
      }
    }
  };

  const handleVideoClick = () => {
    handlePlay();
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-black rounded-lg overflow-hidden ${
        isFullscreen ? 'h-screen flex items-center justify-center' : 'h-72'
      }`}
    >
      {/* Video poster/cover image */}
      {showPoster && !isPlaying && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handleVideoClick}
        >
          <img
            src={effectivePosterUrl}
            alt="Video cover"
            className={`w-full h-full object-cover ${
              isFullscreen ? 'object-contain' : 'object-cover'
            }`}
            onError={(e) => {
              // If poster fails to load, use a gradient placeholder
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
              <Play className="w-12 h-12 text-white ml-1" />
            </div>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        className={`cursor-pointer ${
          isFullscreen 
            ? 'max-w-full max-h-full object-contain' 
            : 'w-full h-full object-contain'
        } ${showPoster && !isPlaying ? 'opacity-0' : 'opacity-100'}`}
        poster={effectivePosterUrl}
        preload="metadata"
        playsInline
        webkit-playsinline="true"
        onError={(e) => {
          setVideoError('Failed to load video. Please check the file format and URL.');
          setIsLoading(false);
          setIsBuffering(false);
          setShowPoster(true);
          console.error('[PostVideoPlayer] Video failed to load:', src, e);
        }}
        onLoadStart={() => {
          setIsLoading(true);
          setVideoError(null);
          console.log('[PostVideoPlayer] Video loading started:', src);
        }}
        onLoadedData={() => {
          setIsLoading(false);
          console.log('[PostVideoPlayer] Video data loaded:', src);
        }}
        onCanPlay={() => {
          setVideoError(null);
          setIsLoading(false);
          setIsBuffering(false);
          console.log('[PostVideoPlayer] Video can be played:', src);
        }}
        onCanPlayThrough={() => {
          setIsBuffering(false);
          console.log('[PostVideoPlayer] Video can play through:', src);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setShowControls(false);
          setIsBuffering(false);
          setShowPoster(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
          setShowPoster(true);
        }}
        onWaiting={() => {
          setIsBuffering(true);
          console.log('[PostVideoPlayer] Video is buffering:', src);
        }}
        onPlaying={() => {
          setIsBuffering(false);
          console.log('[PostVideoPlayer] Video is playing:', src);
        }}
        onStalled={() => {
          setIsBuffering(true);
          console.log('[PostVideoPlayer] Video stalled:', src);
        }}
        onSuspend={() => {
          console.log('[PostVideoPlayer] Video suspended:', src);
        }}
        onClick={handleVideoClick}
        controls={false}
      >
        Sorry, your browser can't play this video.
      </video>
      
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white p-4">
            <p className="text-red-400 font-bold mb-2">{videoError}</p>
            <p className="text-xs text-gray-300 break-all">{src}</p>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {(isLoading || isBuffering) && !showPoster && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {showControls && !videoError && !isLoading && !showPoster && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors"
            disabled={isBuffering}
          >
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white ml-1" />
            )}
          </button>
        </div>
      )}
      
      {/* Video controls overlay */}
      {!showPoster && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={handlePlay}
              className="flex items-center space-x-2 hover:text-gray-300"
              disabled={isBuffering || isLoading}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span className="text-sm">
                {isBuffering ? 'Buffering...' : isPlaying ? 'Pause' : 'Play'}
              </span>
            </button>
            
            <button
              onClick={handleFullscreen}
              className="flex items-center space-x-2 hover:text-gray-300"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
              <span className="text-sm">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostVideoPlayer;
