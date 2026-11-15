import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"
import { fieldClasses } from "@/components/ui/input"

/**
 * A styled native <select>. Native selects submit with plain HTML forms, work
 * with every assistive technology and give children the platform picker they
 * already know on phones and tablets.
 */
function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(fieldClasses, "h-12 appearance-none pr-11", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-500"
      />
    </div>
  )
}

export { NativeSelect }
