
import React, { useState, useRef } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("[PostVideoPlayer] src:", src);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
  React.useEffect(() => {
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
      <video
        ref={videoRef}
        src={src}
        className={`cursor-pointer ${
          isFullscreen 
            ? 'max-w-full max-h-full object-contain' 
            : 'w-full h-full object-cover'
        }`}
        poster={posterUrl}
        preload="metadata"
        playsInline
        onError={(e) => {
          setVideoError('Failed to load video. Please check the file format and URL.');
          console.error('[PostVideoPlayer] Video failed to load:', src, e);
        }}
        onCanPlay={() => {
          setVideoError(null);
          console.log('[PostVideoPlayer] Video can be played:', src);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setShowControls(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowControls(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
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
      
      {showControls && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors"
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
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <button
            onClick={handlePlay}
            className="flex items-center space-x-2 hover:text-gray-300"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
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
    </div>
  );
};

export default PostVideoPlayer;
