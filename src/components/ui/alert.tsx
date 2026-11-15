import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const alertVariants = cva(
  "relative grid w-full grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-2xl border-2 px-4 py-3 text-left text-sm [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        info: "border-electric-100 bg-electric-50 text-ink-800 [&>svg]:text-electric-600",
        success: "border-aqua-100 bg-aqua-50 text-ink-800 [&>svg]:text-aqua-700",
        warning: "border-sun-300 bg-sun-50 text-ink-800 [&>svg]:text-sun-700",
        destructive: "border-coral-100 bg-coral-50 text-coral-700 [&>svg]:text-coral-600",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

function Alert({
  className,
  variant,
  role = "status",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role={role}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-title"
      className={cn("col-start-2 font-heading text-base font-semibold", className)}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("col-start-2 leading-relaxed [&_a]:font-bold [&_a]:underline", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
