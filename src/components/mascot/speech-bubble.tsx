import { cn } from "cn"

/** A speech bubble for Spark. `tail` says which side the mascot stands on. */
export function SpeechBubble({
  children,
  tail = "left",
  className,
}: {
  children: React.ReactNode
  tail?: "left" | "bottom" | "none"
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-3xl bg-white px-5 py-4 text-ink-900 shadow-soft ring-1 ring-ink-900/5",
        className
      )}
    >
      {tail === "left" ? (
        <span
          aria-hidden="true"
          className="absolute top-8 -left-2 size-5 rotate-45 rounded-sm bg-white ring-1 ring-ink-900/5 [clip-path:polygon(0_0,0_100%,100%_100%)]"
        />
      ) : null}
      {tail === "bottom" ? (
        <span
          aria-hidden="true"
          className="absolute -bottom-2 left-10 size-5 rotate-45 rounded-sm bg-white ring-1 ring-ink-900/5 [clip-path:polygon(100%_0,0_100%,100%_100%)]"
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  )
}
