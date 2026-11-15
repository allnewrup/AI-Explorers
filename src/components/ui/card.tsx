import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const cardVariants = cva(
  "group/card flex flex-col rounded-3xl text-card-foreground",
  {
    variants: {
      variant: {
        default: "bg-card shadow-soft ring-1 ring-ink-900/5",
        elevated: "bg-card shadow-card ring-1 ring-ink-900/5",
        outline: "border-2 border-ink-200 bg-card",
        dashed: "border-2 border-dashed border-ink-300 bg-white/60",
        navy: "bg-ink-900 text-white shadow-card",
        electric: "bg-electric-50 ring-1 ring-electric-100",
        nebula: "bg-nebula-50 ring-1 ring-nebula-100",
        aqua: "bg-aqua-50 ring-1 ring-aqua-100",
        sun: "bg-sun-50 ring-1 ring-sun-100",
      },
      padding: {
        none: "",
        sm: "gap-3 p-4",
        default: "gap-4 p-5 sm:p-6",
        lg: "gap-5 p-6 sm:p-8",
      },
      interactive: {
        true: "transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift focus-within:shadow-lift",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      interactive: false,
    },
  }
)

function Card({
  className,
  variant,
  padding,
  interactive,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  as: Comp = "h3",
  ...props
}: React.ComponentProps<"h3"> & { as?: "h2" | "h3" | "h4" | "div" }) {
  return (
    <Comp
      data-slot="card-title"
      className={cn("font-heading text-xl font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-auto flex flex-wrap items-center gap-3 pt-2", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
