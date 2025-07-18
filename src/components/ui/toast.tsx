
import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ title, description, variant = 'default', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border p-4 shadow-lg",
      variant === 'destructive' 
        ? "bg-red-900 border-red-800 text-red-100" 
        : "bg-gray-800 border-gray-700 text-white"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
