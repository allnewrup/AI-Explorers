import { cn } from "cn"
import { Spark, type SparkMood } from "@/components/mascot/spark"

/**
 * Shown wherever there is genuinely nothing to display yet. It explains why
 * the space is empty and what to do next, instead of inventing sample data.
 */
export function EmptyState({
  title,
  description,
  action,
  mood = "thinking",
  compact = false,
  className,
}: {
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  mood?: SparkMood
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-3xl border-2 border-dashed border-ink-300 bg-white/60 text-center",
        compact ? "gap-2 px-5 py-6" : "gap-3 px-6 py-10",
        className
      )}
    >
      <Spark mood={mood} size={compact ? 72 : 110} />
      <p className={cn("font-heading font-semibold text-ink-900", compact ? "text-lg" : "text-xl")}>
        {title}
      </p>
      {description ? (
        <div className="max-w-md text-sm leading-relaxed text-ink-500">{description}</div>
      ) : null}
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  )
}
