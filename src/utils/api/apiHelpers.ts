
import { supabase } from '@/integrations/supabase/client';

export interface ApiError {
  message: string;
  code?: string;
}

export const handleApiError = (error: any): ApiError => {
  if (error?.message) {
    return { message: error.message, code: error.code };
  }
  return { message: 'An unexpected error occurred' };
};

// Helper function to get current user ID with security validation
export const getCurrentUserId = async (): Promise<string> => {
  // Lazy import to avoid circular dependency
  const { requireAuth } = await import('@/utils/authorizationUtils');
  const context = await requireAuth();
  return context.userId;
};
