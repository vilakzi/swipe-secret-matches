
type PromotionType = 'free_2h' | 'paid_8h' | 'paid_12h';

export const calculateExpiryTime = (type: string) => {
  const now = new Date();
  switch (type) {
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

export const generateFileName = (userId: string, fileExtension: string) => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${randomSuffix}.${fileExtension}`;
};

export const validateFileSize = (file: File, maxSize: number = 50 * 1024 * 1024) => {
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum file size is ${Math.round(maxSize / (1024 * 1024))}MB for mobile uploads`);
  }
};

export const getFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase();
};

export const getPostType = (fileType: string) => {
  return fileType.startsWith('image/') ? 'image' : 'video';
};
