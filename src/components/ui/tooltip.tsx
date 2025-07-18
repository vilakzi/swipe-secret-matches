import * as React from "react"
// import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Temporarily disabled to fix React hook violations
// const TooltipProvider = TooltipPrimitive.Provider
// const Tooltip = TooltipPrimitive.Root
// const TooltipTrigger = TooltipPrimitive.Trigger

// Simple placeholder components to prevent import errors
const TooltipProvider = ({ children, ...props }: any) => <>{children}</>
const Tooltip = ({ children, ...props }: any) => <>{children}</>
const TooltipTrigger = React.forwardRef<HTMLDivElement, any>(({ children, asChild, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "div"
  return <Comp ref={ref} {...props}>{children}</Comp>
})

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    sideOffset?: number
  }
>(({ className, sideOffset = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
