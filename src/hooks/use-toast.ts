
// Simple toast replacement to fix broken imports
// This prevents the useState error by avoiding Radix UI dependencies

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export interface ToastActionElement {
  // Simplified action element
}

let toastId = 0;

export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    // Simple console logging instead of UI toasts for now
    console.log(`🍞 Toast (${variant}):`, title || description);
    
    // Return a mock toast object
    return {
      id: (++toastId).toString(),
      title,
      description,
      variant,
      dismiss: () => console.log('Toast dismissed')
    };
  };

  const dismiss = (toastId?: string) => {
    console.log('Dismissing toast:', toastId);
  };

  return {
    toast,
    dismiss,
    toasts: [] // Empty array for now
  };
};

// Export toast function directly for convenience
export const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
  console.log(`🍞 Toast (${variant}):`, title || description);
  return {
    id: (++toastId).toString(),
    title,
    description,
    variant
  };
};
