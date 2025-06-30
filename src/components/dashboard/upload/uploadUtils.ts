
export const calculateExpiryTime = (promotionType: string): Date => {
  const now = new Date();
  switch (promotionType) {
    case 'free_2h':
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case 'paid_8h':
      return new Date(now.getTime() + 8 * 60 * 60 * 1000);
    case 'paid_12h':
      return new Date(now.getTime() + 12 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
  }
};

export const getPostType = (fileType: string): string => {
  if (fileType.startsWith('image/')) {
    return 'image';
  } else if (fileType.startsWith('video/')) {
    return 'video';
  }
  return 'image';
};

export const generateFileName = (userId: string, fileExt: string): string => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${userId}/post_${timestamp}_${randomId}.${fileExt}`;
};

export const getFileExtension = (filename: string): string | null => {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() || null : null;
};

export const validateFileSize = (file: File, maxSize?: number): void => {
  const limit = maxSize || 50 * 1024 * 1024; // Default 50MB
  if (file.size > limit) {
    throw new Error(`File size exceeds ${Math.round(limit / (1024 * 1024))}MB limit`);
  }
};
