
import { createContext, useContext, useRef, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";
import MediaToastContent from "@/components/ui/MediaToastContent";

interface ErrorContextType {
  addError: (message: string, type?: 'error' | 'success' | 'warning') => void;
  addMediaToast: (options: {
    title?: string;
    message: string;
    type?: 'error' | 'success' | 'warning';
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    mediaPoster?: string;
  }) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Enhanced error provider with media toast support
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

  const addMediaToast = (options: {
    title?: string;
    message: string;
    type?: 'error' | 'success' | 'warning';
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    mediaPoster?: string;
  }) => {
    const { title, message, type = 'success', mediaUrl, mediaType, mediaPoster } = options;
    
    const now = Date.now();
    // Don't spam same toast (in 1s)
    if (
      message === lastToast.current.msg &&
      now - lastToast.current.ts < 1000
    ) {
      return;
    }
    lastToast.current = { msg: message, ts: now };

    toast({
      title: undefined, // We'll handle title in the custom content
      description: (
        <MediaToastContent
          title={title}
          description={message}
          mediaUrl={mediaUrl}
          mediaType={mediaType}
          mediaPoster={mediaPoster}
        />
      ),
      variant: type === 'error' ? "destructive" : "default"
    });
  };

  return (
    <ErrorContext.Provider value={{ addError, addMediaToast }}>
      {children}
    </ErrorContext.Provider>
  );
};

// Enhanced hook with media toast support
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

export default ErrorProvider;
