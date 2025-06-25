
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

const PostVideoPlayer = ({ src, poster, className = '' }: PostVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate a poster from the video if none provided
  const [generatedPoster, setGeneratedPoster] = useState<string>('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Mobile-specific optimizations
    video.playsInline = true;
    video.preload = 'metadata';
    
    const handleLoadedData = () => {
      setIsLoading(false);
      // Generate poster if none provided (mobile-friendly)
      if (!poster && !generatedPoster) {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            setGeneratedPoster(canvas.toDataURL('image/jpeg', 0.8));
          }
        } catch (err) {
          console.log('Could not generate poster:', err);
        }
      }
    };

    const handleError = () => {
      setError(true);
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, [poster, generatedPoster]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        await video.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Video play error:', err);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlay();
  };

  // Auto-hide controls on mobile after 3 seconds
  useEffect(() => {
    if (showControls && isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls, isPlaying]);

  if (error) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center h-72 ${className}`}>
        <div className="text-center text-gray-400">
          <div className="text-sm">Video unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(true)}
      onTouchStart={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || generatedPoster || undefined}
        className="w-full h-72 object-contain cursor-pointer"
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 touch-target"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20 touch-target"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostVideoPlayer;
