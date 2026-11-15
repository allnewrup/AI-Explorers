import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/**
 * Buttons are deliberately large: the smallest interactive size is 40px and
 * the default is 44px, which keeps touch targets comfortable for children.
 * "Chunky" variants (default, playful, success) have a solid lower edge that
 * presses down on click.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-transparent font-heading font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-150 outline-none select-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_0_0_var(--color-electric-700)] hover:bg-electric-500 active:translate-y-1 active:shadow-none",
        playful:
          "bg-sun-400 text-ink-900 shadow-[0_4px_0_0_var(--color-sun-500)] hover:bg-sun-300 active:translate-y-1 active:shadow-none",
        success:
          "bg-aqua-700 text-white shadow-[0_4px_0_0_#0a5f5a] hover:bg-aqua-600 active:translate-y-1 active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-nebula-300/40",
        outline:
          "border-ink-200 bg-card text-ink-900 hover:border-electric-300 hover:bg-electric-50",
        ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
        "ghost-inverse": "text-white hover:bg-white/10",
        destructive:
          "bg-destructive text-white shadow-[0_4px_0_0_var(--color-coral-700)] hover:bg-coral-500 active:translate-y-1 active:shadow-none",
        link: "h-auto rounded-md px-0 font-sans font-bold text-electric-700 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        default: "h-11 px-5 text-base",
        lg: "h-13 px-7 text-lg",
        xl: "h-15 rounded-2xl px-9 text-xl",
        icon: "size-11",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
