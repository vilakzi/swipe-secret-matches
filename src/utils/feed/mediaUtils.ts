
export function isValidMedia(url?: string) {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm'].includes(ext ?? '');
}
