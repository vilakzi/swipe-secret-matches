
export function isValidMedia(url?: string) {
  if (!url) return false;
  
  try {
    // Check if it's a valid URL
    new URL(url);
    
    const ext = url.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'flv', 'wmv'];
    
    return validExtensions.includes(ext ?? '');
  } catch {
    // If URL parsing fails, check if it's a relative path with valid extension
    const ext = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'flv', 'wmv'].includes(ext ?? '');
  }
}

export function isVideo(url?: string) {
  if (!url) return false;
  
  // Check for video file extensions
  const ext = url.split('.').pop()?.toLowerCase();
  const videoExtensions = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'flv', 'wmv', 'ogv', '3gp'];
  
  if (videoExtensions.includes(ext ?? '')) {
    return true;
  }
  
  // Check for video MIME types in URL or common video hosting patterns
  const videoPatterns = [
    /video\//i,
    /\.mp4/i,
    /\.webm/i,
    /\.mov/i,
    /youtube\.com/i,
    /vimeo\.com/i,
    /dailymotion\.com/i
  ];
  
  return videoPatterns.some(pattern => pattern.test(url));
}

export function isImage(url?: string) {
  if (!url) return false;
  
  // Check for image file extensions
  const ext = url.split('.').pop()?.toLowerCase();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'ico', 'tiff', 'tif'];
  
  if (imageExtensions.includes(ext ?? '')) {
    return true;
  }
  
  // Check for image MIME types in URL
  const imagePatterns = [
    /image\//i,
    /\.jpg/i,
    /\.jpeg/i,
    /\.png/i,
    /\.webp/i,
    /\.gif/i
  ];
  
  return imagePatterns.some(pattern => pattern.test(url));
}

export function getMediaType(url?: string): 'image' | 'video' | 'unknown' {
  if (!url) return 'unknown';
  
  if (isVideo(url)) return 'video';
  if (isImage(url)) return 'image';
  
  return 'unknown';
}

export function extractVideoId(url: string): string | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  if (youtubeMatch) return youtubeMatch[1];
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return vimeoMatch[1];
  
  return null;
}
