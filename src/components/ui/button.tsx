import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl hover:scale-105",
        outline:
          "border-2 border-primary/30 bg-card/50 backdrop-blur-sm text-primary hover:bg-primary/10 hover:border-primary/50 shadow-lg hover:shadow-xl",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg hover:shadow-xl hover:scale-105",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        premium: "bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground hover:from-primary/90 hover:to-cyan-400/90 shadow-lg hover:shadow-xl hover:scale-105",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
