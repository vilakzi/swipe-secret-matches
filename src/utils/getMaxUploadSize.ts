
export const getMaxUploadSize = (role?: string): number => {
  switch (role) {
    case 'admin':
      return 100 * 1024 * 1024; // 100MB for admins
    case 'service_provider':
      return 50 * 1024 * 1024;  // 50MB for service providers
    default:
      return 10 * 1024 * 1024;  // 10MB for regular users
  }
};
