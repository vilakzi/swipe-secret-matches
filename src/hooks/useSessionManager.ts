
import { useEffect } from 'react';
import { sessionManager } from "@/utils/secureSessionManager";

export const useSessionManager = () => {
  useEffect(() => {
    // Initialize secure session management
    sessionManager.startPeriodicValidation();

    // Cleanup on app unmount
    return () => {
      sessionManager.stopPeriodicValidation();
    };
  }, []);
};
