
import { createContext, useContext, useRef, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

interface ErrorContextType {
  addError: (message: string, type?: 'error' | 'success' | 'warning') => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Provide all app errors as sharp toasts (uses shadcn/ui)
export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  // Debounce duplicate error toasts
  const lastToast = useRef<{ msg: string; ts: number }>({ msg: "", ts: 0 });

  const addError = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    const now = Date.now();
    // Don't spam same error (in 1s)
    if (
      message === lastToast.current.msg &&
      now - lastToast.current.ts < 1000
    ) {
      return;
    }
    lastToast.current = { msg: message, ts: now };

    toast({
      title: type === "error" ? "Error" : type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      variant: type === 'error' ? "destructive" : "default"
    });
  };

  return (
    <ErrorContext.Provider value={{ addError }}>
      {children}
    </ErrorContext.Provider>
  );
};

// Custom react hook for adding errors globally
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

export default ErrorProvider;
