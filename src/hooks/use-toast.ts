
interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let globalToastFunction: ((toast: ToastProps) => void) | null = null;

export const setGlobalToastFunction = (fn: (toast: ToastProps) => void) => {
  globalToastFunction = fn;
};

export const toast = ({ title, description, variant = 'default' }: ToastProps) => {
  if (globalToastFunction) {
    globalToastFunction({ title, description, variant });
  } else {
    // Fallback to console
    const message = `${title}${description ? ': ' + description : ''}`;
    if (variant === 'destructive') {
      console.error('🚨 Error Toast:', message);
    } else {
      console.log('✅ Success Toast:', message);
    }
  }
};

export const useToast = () => {
  return { toast };
};
