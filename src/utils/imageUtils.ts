
export const resizeImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 5MB'
    };
  }

  return { valid: true };
};

export const generateThumbnail = (imageUrl: string, size: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;

      // Calculate crop area (center crop)
      const scale = Math.max(size / img.width, size / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;

      ctx?.drawImage(img, x, y, scaledWidth, scaledHeight);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl);
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
};
