import { Flame, Zap } from "lucide-react"
import { cn } from "cn"
import { Progress } from "@/components/ui/progress"
import type { LevelProgress } from "@/config/gamification"
import { pluralise } from "@/lib/format"

export function XpPill({ totalXp, className }: { totalXp: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-sun-400 px-4 font-heading text-base font-bold whitespace-nowrap text-ink-900",
        className
      )}
    >
      <Zap className="size-4 fill-ink-900" aria-hidden="true" />
      <span>
        {totalXp.toLocaleString("en-GB")}
        <span className="sr-only"> experience points</span>
        <span aria-hidden="true"> XP</span>
      </span>
    </span>
  )
}

export function StreakBadge({ days, className }: { days: number; className?: string }) {
  const active = days > 0
  return (
    <span
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 font-heading text-base font-bold whitespace-nowrap",
        active ? "bg-coral-100 text-coral-700" : "bg-ink-100 text-ink-600",
        className
      )}
    >
      <Flame className={cn("size-4", active && "fill-coral-500 text-coral-600")} aria-hidden="true" />
      <span>
        {days}
        <span className="sr-only"> day learning streak</span>
      </span>
    </span>
  )
}

export function LevelCard({ level, className }: { level: LevelProgress; className?: string }) {
  return (
    <div className={cn("rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5", className)}>
      <div className="flex items-center gap-4">
        <div
          className="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-linear-to-br from-electric-500 to-nebula-500 text-white"
          aria-hidden="true"
        >
          <span className="text-[0.65rem] font-bold tracking-widest uppercase">Level</span>
          <span className="font-heading text-2xl leading-none font-bold">{level.level}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-xl font-semibold text-ink-900">
            <span className="sr-only">Level {level.level}: </span>
            {level.title}
          </p>
          <p className="text-sm text-ink-500">
            {level.isMaxLevel
              ? "Top level reached. Amazing work!"
              : `${level.xpRemaining} XP to reach ${level.nextTitle}`}
          </p>
        </div>
      </div>
      <Progress
        className="mt-4"
        value={level.percent}
        label={`Progress to level ${level.level + 1}`}
        tone="electric"
      />
    </div>
  )
}

export function StatTile({
  icon,
  label,
  value,
  hint,
  tone = "electric",
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  tone?: "electric" | "nebula" | "aqua" | "sun" | "coral"
}) {
  const tones = {
    electric: "bg-electric-100 text-electric-700",
    nebula: "bg-nebula-100 text-nebula-700",
    aqua: "bg-aqua-100 text-aqua-700",
    sun: "bg-sun-100 text-sun-700",
    coral: "bg-coral-100 text-coral-700",
  } as const
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5">
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl [&_svg]:size-6", tones[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-ink-500">{label}</p>
        <p className="font-heading text-2xl font-semibold text-ink-900">{value}</p>
        {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      </div>
    </div>
  )
}

export function streakLabel(days: number): string {
  return days === 0 ? "No streak yet" : `${pluralise(days, "day")} in a row`
}
