import { cn } from "cn"
import { Spark } from "@/components/mascot/spark"

export function ErrorState({
  title = "Oops! Something went wrong",
  description = "It is not your fault. Please try again in a moment.",
  action,
  className,
}: {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        "mx-auto flex max-w-lg flex-col items-center gap-3 rounded-3xl bg-white px-6 py-10 text-center shadow-soft ring-1 ring-coral-100",
        className
      )}
    >
      <Spark mood="oops" size={120} />
      <h2 className="text-2xl font-semibold text-ink-900">{title}</h2>
      <div className="text-sm leading-relaxed text-ink-500">{description}</div>
      {action ? <div className="mt-2 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  )
}
