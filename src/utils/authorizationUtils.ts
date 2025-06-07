
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SecurityContext {
  userId: string;
  role: 'user' | 'service_provider' | 'admin';
  isAuthenticated: boolean;
}

export const getCurrentSecurityContext = async (): Promise<SecurityContext | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get user role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user role:', profileError);
      return {
        userId: user.id,
        role: 'user',
        isAuthenticated: true
      };
    }

    return {
      userId: user.id,
      role: profile?.role || 'user',
      isAuthenticated: true
    };
  } catch (error) {
    console.error('Error getting security context:', error);
    return null;
  }
};

export const requireAuth = async (): Promise<SecurityContext> => {
  const context = await getCurrentSecurityContext();
  
  if (!context) {
    throw new Error('Authentication required');
  }
  
  return context;
};

export const requireRole = async (requiredRole: 'admin' | 'service_provider'): Promise<SecurityContext> => {
  const context = await requireAuth();
  
  if (requiredRole === 'admin' && context.role !== 'admin') {
    throw new Error('Admin privileges required');
  }
  
  if (requiredRole === 'service_provider' && context.role !== 'service_provider' && context.role !== 'admin') {
    throw new Error('Service provider privileges required');
  }
  
  return context;
};

export const logSensitiveOperation = async (
  action: string,
  tableName: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    await supabase.rpc('log_sensitive_operation', {
      p_action: action,
      p_table_name: tableName,
      p_record_id: recordId || null,
      p_old_values: oldValues ? JSON.stringify(oldValues) : null,
      p_new_values: newValues ? JSON.stringify(newValues) : null
    });
  } catch (error) {
    console.error('Failed to log sensitive operation:', error);
  }
};

export const validateUserOwnership = (resourceUserId: string, currentUserId: string): boolean => {
  return resourceUserId === currentUserId;
};

export const hasPermission = (
  userRole: 'user' | 'service_provider' | 'admin',
  requiredPermission: 'read' | 'write' | 'admin'
): boolean => {
  switch (requiredPermission) {
    case 'read':
      return ['user', 'service_provider', 'admin'].includes(userRole);
    case 'write':
      return ['service_provider', 'admin'].includes(userRole);
    case 'admin':
      return userRole === 'admin';
    default:
      return false;
  }
};
