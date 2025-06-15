
export function isValidMedia(url?: string) {
  if (!url) return false;
  
  try {
    // Check if it's a valid URL
    new URL(url);
    
    const ext = url.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm', 'avi', 'mkv'];
    
    return validExtensions.includes(ext ?? '');
  } catch {
    // If URL parsing fails, check if it's a relative path with valid extension
    const ext = url.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext ?? '');
  }
}

export function isVideo(url?: string) {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext ?? '');
}

export function isImage(url?: string) {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext ?? '');
}
