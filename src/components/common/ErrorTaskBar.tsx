
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ErrorItem {
  id: number;
  message: string;
  type: 'error' | 'success' | 'warning';
  timestamp: Date;
}

interface ErrorContextType {
  errors: ErrorItem[];
  addError: (message: string, type?: 'error' | 'success' | 'warning') => void;
  removeError: (id: number) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const [errors, setErrors] = useState<ErrorItem[]>([]);

  const addError = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    const id = Date.now();
    setErrors(prev => [...prev, { id, message, type, timestamp: new Date() }]);
    
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      setErrors(prev => prev.filter(error => error.id !== id));
    }, 5000);
  };

  const removeError = (id: number) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError }}>
      {children}
      <ErrorTaskBar />
    </ErrorContext.Provider>
  );
};

const ErrorTaskBar = () => {
  const context = useContext(ErrorContext);
  if (!context) return null;
  
  const { errors, removeError } = context;

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50 border-t-2 border-red-500 font-mono text-sm">
      {errors.map(error => (
        <div key={error.id} className="flex justify-between items-center mb-1 last:mb-0">
          <span>
            <strong>[{error.type.toUpperCase()}]</strong> {error.message}
          </span>
          <button 
            onClick={() => removeError(error.id)}
            className="bg-transparent border border-white text-white px-2 py-1 cursor-pointer ml-2 hover:bg-white hover:text-black"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};
