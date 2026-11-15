import { cn } from "cn"

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: string
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-2">
        {eyebrow ? <div className="flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
        <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{title}</h1>
        {description ? <p className="max-w-2xl text-ink-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}
