import * as React from "react"
import { cn } from "cn"

export const fieldClasses =
  "w-full min-w-0 rounded-xl border-2 border-input bg-white px-4 text-base text-ink-900 transition-colors outline-none placeholder:text-ink-400 focus-visible:border-electric-500 focus-visible:outline-3 focus-visible:outline-offset-0 focus-visible:outline-electric-500/30 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:outline-coral-500/30"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldClasses, "h-12", className)}
      {...props}
    />
  )
}

export { Input }
