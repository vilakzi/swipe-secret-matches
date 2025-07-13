
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export class SecureSessionManager {
  private static instance: SecureSessionManager;
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): SecureSessionManager {
    if (!SecureSessionManager.instance) {
      SecureSessionManager.instance = new SecureSessionManager();
    }
    return SecureSessionManager.instance;
  }

  public async validateSession(): Promise<boolean> {
    try {
      // Check network connectivity first
      if (!navigator.onLine) {
        toast({
          title: 'Network Error',
          description: 'Please check your internet connection',
          variant: 'destructive',
        });
        return false;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session validation error:', error);
        toast({
          title: 'Authentication Error',
          description: 'Your session could not be validated. Please try logging in again.',
          variant: 'destructive',
        });
        return false;
      }

      if (!session) {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });
        return false;
      }

      // Check if token is about to expire (within 5 minutes)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 300) { // 5 minutes
        console.log('Token expiring soon, refreshing...');
        return await this.refreshSession();
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }

  public async refreshSession(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        await this.handleSessionError();
        return false;
      }

      if (!session) {
        await this.handleSessionError();
        return false;
      }

      console.log('Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      await this.handleSessionError();
      return false;
    }
  }

  private async handleSessionError(): Promise<void> {
    console.log('Handling session error - signing out');
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been signed out due to a session error. Please sign in again.',
        variant: 'destructive',
      });

      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during cleanup signout:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out properly. Please refresh the page.',
        variant: 'destructive',
      });
    }
    
    // Clear any sensitive data from localStorage
    this.clearSensitiveData();
  }

  public clearSensitiveData(): void {
    // Clear any cached sensitive data
    const keysToRemove = [
      'sb-auth-token',
      'supabase.auth.token',
      'sb-galrcqwogqqdsqdzfrrd-auth-token'
    ];

    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing ${key}:`, error);
      }
    });
  }

  public startPeriodicValidation(): void {
    // Validate session every 10 minutes
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(async () => {
      const isValid = await this.validateSession();
      if (!isValid) {
        console.log('Session validation failed, stopping periodic checks');
        this.stopPeriodicValidation();
      }
    }, 10 * 60 * 1000); // 10 minutes
  }

  public stopPeriodicValidation(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  public async secureSignOut(): Promise<void> {
    this.stopPeriodicValidation();
    this.clearSensitiveData();
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during secure signout:', error);
    }
  }
}

export const sessionManager = SecureSessionManager.getInstance();
