
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
  const [previewGenerated, setPreviewGenerated] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("[PostVideoPlayer] src:", src, "posterUrl:", posterUrl);

  // Generate video frame preview with improved CORS handling
  const generateVideoPreview = async () => {
    if (!videoRef.current || previewGenerated) return;

    try {
      const video = videoRef.current;
      
      // Wait for video metadata to load
      if (video.readyState >= 1) {
        // Create a canvas for preview generation
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // Set canvas dimensions
        canvas.width = video.videoWidth || 480;
        canvas.height = video.videoHeight || 320;
        
        // Create a promise to handle the seeked event
        const seekToPreviewFrame = () => {
          return new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Seek timeout'));
            }, 5000);

            const onSeeked = () => {
              clearTimeout(timeout);
              video.removeEventListener('seeked', onSeeked);
              resolve();
            };

            video.addEventListener('seeked', onSeeked);
            
            // Seek to 10% of video duration for a good preview frame
            const seekTime = Math.min(video.duration * 0.1, 5); // Max 5 seconds
            video.currentTime = seekTime;
          });
        };

        try {
          await seekToPreviewFrame();
          
          // Draw frame to canvas with CORS handling
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to data URL with error handling
          const dataURL = canvas.toDataURL('image/jpeg', 0.7);
          setGeneratedPoster(dataURL);
          setPreviewGenerated(true);
          
          // Reset video time
          video.currentTime = 0;
          
          console.log('[PostVideoPlayer] Video preview generated successfully');
        } catch (drawError) {
          console.warn('[PostVideoPlayer] Could not generate preview due to CORS restrictions');
          setPreviewGenerated(true); // Mark as attempted to avoid retries
        }
      }
    } catch (error) {
      console.warn('[PostVideoPlayer] Preview generation failed:', error);
      setPreviewGenerated(true); // Mark as attempted to avoid retries
    }
  };

  // Get effective poster URL with better fallback strategy
  const getEffectivePosterUrl = () => {
    // Priority: provided poster > generated preview > no poster (show video)
    if (posterUrl && posterUrl !== 'undefined') {
      return posterUrl;
    }
    if (generatedPoster) {
      return generatedPoster;
    }
    return null; // No poster available, will show video directly
  };

  const effectivePosterUrl = getEffectivePosterUrl();

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

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
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

  // Initialize volume when video loads
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-black rounded-lg overflow-hidden ${
        isFullscreen ? 'h-screen flex items-center justify-center' : 'h-72'
      }`}
    >
      {/* Show poster only if we have a valid poster URL and poster should be shown */}
      {effectivePosterUrl && showPoster && (
        <VideoPoster
          posterUrl={effectivePosterUrl}
          isFullscreen={isFullscreen}
          showPoster={showPoster}
          onVideoClick={handleVideoClick}
          onPosterLoad={() => setPosterLoaded(true)}
        />
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        className={`cursor-pointer ${
          isFullscreen 
            ? 'max-w-full max-h-full object-contain' 
            : 'w-full h-full object-cover'
        } ${(effectivePosterUrl && showPoster) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        preload="metadata"
        playsInline
        webkit-playsinline="true"
        crossOrigin="anonymous"
        onError={(e) => {
          setVideoError('Failed to load video. Please check the file format and URL.');
          setIsLoading(false);
          setIsBuffering(false);
          setShowPoster(false); // Show video element even if there's an error
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
          if (!posterUrl || posterUrl === 'undefined') {
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
          setShowPoster(!!effectivePosterUrl);
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
        showPoster={showPoster && !!effectivePosterUrl}
      />
      <VideoControls
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        isLoading={isLoading}
        isFullscreen={isFullscreen}
        showControls={showControls}
        showPoster={showPoster && !!effectivePosterUrl}
        videoError={videoError}
        volume={volume}
        isMuted={isMuted}
        onPlay={handlePlay}
        onFullscreen={handleFullscreen}
        onVolumeChange={handleVolumeChange}
        onMuteToggle={handleMuteToggle}
      />
    </div>
  );
};

export default PostVideoPlayer;
