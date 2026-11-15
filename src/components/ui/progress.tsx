import * as React from "react"
import { cn } from "cn"

const tones = {
  electric: "bg-electric-500",
  nebula: "bg-nebula-500",
  aqua: "bg-aqua-500",
  sun: "bg-sun-500",
} as const

export type ProgressTone = keyof typeof tones

/**
 * A server-renderable progress bar. `label` is required so the value is always
 * announced with context by screen readers.
 */
function Progress({
  value,
  max = 100,
  label,
  tone = "electric",
  className,
  trackClassName,
}: {
  value: number
  max?: number
  label: string
  tone?: ProgressTone
  className?: string
  trackClassName?: string
}) {
  const safeMax = max > 0 ? max : 1
  const clamped = Math.min(Math.max(value, 0), safeMax)
  const percent = Math.round((clamped / safeMax) * 100)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={clamped}
      aria-valuetext={`${percent}%`}
      data-slot="progress"
      className={cn(
        "h-3 w-full overflow-hidden rounded-full bg-ink-100",
        trackClassName,
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", tones[tone])}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export { Progress }
