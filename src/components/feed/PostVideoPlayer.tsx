
import React, { useState, useRef, useEffect } from 'react';
import VideoPoster from './video/VideoPoster';
import VideoControls from './video/VideoControls';
import VideoErrorDisplay from './video/VideoErrorDisplay';
import VideoLoadingIndicator from './video/VideoLoadingIndicator';

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
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log("[PostVideoPlayer] src:", src, "posterUrl:", posterUrl);

  // Generate video frame preview
  const generateVideoPreview = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Wait for video metadata to load
      if (video.readyState >= 1) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Seek to 10% of video duration for a good preview frame
        const seekTime = video.duration * 0.1;
        video.currentTime = seekTime;
        
        // Wait for seek to complete
        await new Promise((resolve) => {
          video.addEventListener('seeked', resolve, { once: true });
        });
        
        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        setGeneratedPoster(dataURL);
        
        // Reset video time
        video.currentTime = 0;
      }
    } catch (error) {
      console.error('Error generating video preview:', error);
    }
  };

  // Get effective poster URL - prioritize provided poster, then generated preview
  const effectivePosterUrl = posterUrl || generatedPoster || src.replace(/\.(mp4|mov|webm|avi|mkv)$/i, '.jpg');

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
      {/* Hidden canvas for generating video previews */}
      <canvas ref={canvasRef} className="hidden" />
      
      <VideoPoster
        posterUrl={effectivePosterUrl}
        isFullscreen={isFullscreen}
        showPoster={showPoster}
        onVideoClick={handleVideoClick}
        onPosterLoad={() => setPosterLoaded(true)}
      />

      {/* Video element - hidden when poster is shown */}
      <video
        ref={videoRef}
        src={src}
        className={`cursor-pointer ${
          isFullscreen 
            ? 'max-w-full max-h-full object-contain' 
            : 'w-full h-full object-cover'
        } ${showPoster ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
        onLoadedMetadata={() => {
          console.log('[PostVideoPlayer] Video metadata loaded:', src);
          // Generate preview frame when metadata is loaded
          if (!posterUrl) {
            generateVideoPreview();
          }
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
      
      <VideoErrorDisplay videoError={videoError} src={src} />
      <VideoLoadingIndicator 
        isLoading={isLoading} 
        isBuffering={isBuffering} 
        showPoster={showPoster} 
      />
      <VideoControls
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        showControls={showControls}
        showPoster={showPoster}
        videoError={videoError}
        onPlay={handlePlay}
        onFullscreen={handleFullscreen}
      />
    </div>
  );
};

export default PostVideoPlayer;
