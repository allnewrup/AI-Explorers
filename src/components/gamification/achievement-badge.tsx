import {
  Award,
  Brain,
  Lock,
  Rocket,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { formatDate } from "@/lib/format"

const BADGE_ART: Record<string, { icon: LucideIcon; gradient: string }> = {
  "first-steps": { icon: Sparkles, gradient: "from-sun-500 to-coral-500" },
  "curious-mind": { icon: Brain, gradient: "from-electric-500 to-nebula-500" },
  "pattern-spotter": { icon: Award, gradient: "from-aqua-500 to-electric-500" },
  "fact-detective": { icon: ScanSearch, gradient: "from-ink-800 to-nebula-600" },
  "safety-star": { icon: ShieldCheck, gradient: "from-aqua-700 to-aqua-500" },
  "future-ready": { icon: Rocket, gradient: "from-nebula-600 to-electric-500" },
}

const FALLBACK = { icon: Award, gradient: "from-electric-500 to-nebula-500" }

export type BadgeInfo = {
  title: string
  description: string
  badgeKey: string
  pointsThreshold: number
  earnedAt: string | null
}

export function AchievementBadge({
  achievement,
  compact = false,
}: {
  achievement: BadgeInfo
  compact?: boolean
}) {
  const art = BADGE_ART[achievement.badgeKey] ?? FALLBACK
  const Icon = art.icon
  const earned = achievement.earnedAt !== null

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-3xl p-4",
        earned ? "bg-white shadow-soft ring-1 ring-ink-900/5" : "border-2 border-dashed border-ink-200 bg-white/50"
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-2xl text-white",
          compact ? "size-12" : "size-16",
          earned ? cn("bg-linear-to-br shadow-soft", art.gradient) : "bg-ink-200 text-ink-500"
        )}
        aria-hidden="true"
      >
        {earned ? <Icon className={compact ? "size-6" : "size-8"} /> : <Lock className="size-5" />}
      </span>
      <div className="min-w-0">
        <p className={cn("font-heading font-semibold", earned ? "text-ink-900" : "text-ink-600")}>
          {achievement.title}
          <span className="sr-only">{earned ? " (earned)" : " (locked)"}</span>
        </p>
        <p className="text-sm text-ink-500">{achievement.description}</p>
        {compact ? null : (
          <p className="mt-1 text-xs font-bold text-ink-500">
            {earned
              ? `Earned ${formatDate(achievement.earnedAt)}`
              : `Unlocks at ${achievement.pointsThreshold} XP`}
          </p>
        )}
      </div>
    </div>
  )
}
