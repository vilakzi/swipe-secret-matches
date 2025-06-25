
import { useState, useEffect, useCallback } from 'react';

interface VideoThumbnailOptions {
  timeOffset?: number;
  quality?: number;
  width?: number;
  height?: number;
}

export const useVideoThumbnail = (videoSrc: string, options: VideoThumbnailOptions = {}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    duration: number;
    width: number;
    height: number;
  } | null>(null);

  const {
    timeOffset = 1,
    quality = 0.8,
    width = 400,
    height = 300
  } = options;

  const generateThumbnail = useCallback(async () => {
    if (!videoSrc || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          setMetadata({
            duration: video.duration,
            width: video.videoWidth,
            height: video.videoHeight
          });
          resolve(video);
        };
        video.onerror = () => reject(new Error('Failed to load video metadata'));
        video.src = videoSrc;
      });

      // Seek to the specified time offset (but not beyond video duration)
      const seekTime = Math.min(timeOffset, video.duration * 0.1);
      video.currentTime = seekTime;

      await new Promise((resolve, reject) => {
        video.onseeked = () => resolve(video);
        video.onerror = () => reject(new Error('Failed to seek video'));
      });

      // Generate thumbnail using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Calculate aspect ratio and dimensions
      const videoAspect = video.videoWidth / video.videoHeight;
      const targetAspect = width / height;

      let drawWidth = width;
      let drawHeight = height;

      if (videoAspect > targetAspect) {
        drawHeight = width / videoAspect;
      } else {
        drawWidth = height * videoAspect;
      }

      canvas.width = width;
      canvas.height = height;

      // Center the video in the canvas
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;

      // Fill background with dark color
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, width, height);

      // Draw video frame
      ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

      // Convert to data URL
      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', quality);
      setThumbnail(thumbnailDataUrl);

    } catch (err) {
      console.error('Thumbnail generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
    }
  }, [videoSrc, timeOffset, quality, width, height, isGenerating]);

  useEffect(() => {
    if (videoSrc) {
      generateThumbnail();
    } else {
      setThumbnail(null);
      setMetadata(null);
      setError(null);
    }
  }, [videoSrc, generateThumbnail]);

  const regenerateThumbnail = useCallback(() => {
    setThumbnail(null);
    setError(null);
    generateThumbnail();
  }, [generateThumbnail]);

  return {
    thumbnail,
    isGenerating,
    error,
    metadata,
    regenerateThumbnail
  };
};
