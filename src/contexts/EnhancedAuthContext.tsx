// EnhancedAuthContext.tsx - Complete rewrite
import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';

// Type definitions
interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;
}

interface EnhancedAuthProviderProps {
  children: ReactNode;
}

// Create context with default value
const EnhancedAuthContext = createContext<AuthContextType | null>(null);

// Provider component with error boundary
export const EnhancedAuthProvider: React.FC<EnhancedAuthProviderProps> = ({ children }) => {
  // Use React.useState explicitly to avoid null reference
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Initialize auth state
  React.useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Your login logic here
      const userData = { id: '1', email, name: 'User' }; // Replace with actual API call
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const register = React.useCallback(async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // Your registration logic here
      const newUser = { id: Date.now().toString(), ...userData } as User;
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = React.useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  }), [user, isLoading, login, logout, register]);

  return (
    <EnhancedAuthContext.Provider value={contextValue}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

// Custom hook with error handling
export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(EnhancedAuthContext);
  
  if (!context) {
    throw new Error(
      'useEnhancedAuth must be used within an EnhancedAuthProvider. ' +
      'Make sure your component is wrapped with <EnhancedAuthProvider>.'
    );
  }
  
  return context;
};

// Export context for advanced usage
export { EnhancedAuthContext };