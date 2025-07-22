
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/**
 * Enhanced ToastViewport with larger, responsive sizing for better visual presence
 */
function EnhancedToastViewport({ className = "" }) {
  return (
    <ToastViewport
      className={
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-sm sm:max-w-xl lg:max-w-2xl px-4 flex flex-col items-center space-y-3 " +
        className
      }
      aria-live="polite"
      id="main-toast-viewport"
    />
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <div aria-live="assertive" aria-atomic="true">
        {toasts.map(function ({ id, title, description, action, ...props }) {
          // ARIA: set alert role for danger/destructive, otherwise polite
          const role = props.variant === "destructive" ? "alert" : "status";
          return (
            <Toast key={id} {...props} role={role} aria-live={role === "alert" ? "assertive" : "polite"}>
              <div className="grid gap-2 flex-1" tabIndex={0}>
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
              <ToastClose />
            </Toast>
          )
        })}
      </div>
      {/* Use the enhanced viewport for larger, responsive toasts */}
      <EnhancedToastViewport />
    </ToastProvider>
  )
}
