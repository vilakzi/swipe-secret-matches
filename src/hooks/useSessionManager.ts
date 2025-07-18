
import { useEffect } from 'react';
import { sessionManager } from "@/utils/secureSessionManager";

export const useSessionManager = () => {
  useEffect(() => {
    console.log('🔒 Initializing secure session management');
    
    // Initialize secure session management
    sessionManager.startPeriodicValidation();

    // Cleanup on app unmount
    return () => {
      console.log('🔒 Cleaning up secure session management');
      sessionManager.stopPeriodicValidation();
    };
  }, []);
};
