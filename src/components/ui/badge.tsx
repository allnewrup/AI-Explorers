import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-electric-100 text-electric-700",
        nebula: "bg-nebula-100 text-nebula-700",
        aqua: "bg-aqua-100 text-aqua-700",
        sun: "bg-sun-100 text-sun-700",
        coral: "bg-coral-100 text-coral-700",
        neutral: "bg-ink-100 text-ink-700",
        solid: "bg-ink-900 text-white",
        outline: "border-2 border-ink-200 bg-card text-ink-700",
        glass: "bg-white/15 text-white ring-1 ring-white/25 backdrop-blur",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
