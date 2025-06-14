
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
 * Custom ToastViewport to show toasts at top center of the screen.
 */
function TopCenterToastViewport({ className = "" }) {
  return (
    <ToastViewport
      className={
        // Top: for both mobile/desktop. Full width on mobile, max width on desktop.
        // Center: margin auto horizontal, high z-index, spacing for safe-area, allows toasts to pop over overlays.
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-full max-w-md px-4 flex flex-col items-center space-y-2 " +
        className
      }
    />
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
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
      {/* Use the custom viewport so toasts render top center */}
      <TopCenterToastViewport />
    </ToastProvider>
  )
}

