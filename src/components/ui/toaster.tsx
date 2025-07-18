
import * as React from "react"
import { Toast } from "./toast"

interface ToastData {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToasterContextType {
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, 'id'>) => void
  removeToast: (id: string) => void
}

const ToasterContext = React.createContext<ToasterContextType | undefined>(undefined)

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToasterContext.Provider>
  )
}

export const useToaster = () => {
  const context = React.useContext(ToasterContext)
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider')
  }
  return context
}
