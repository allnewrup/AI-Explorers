import { Crown } from "lucide-react"
import { cn } from "cn"
import { AvatarDisc } from "@/components/gamification/avatar-disc"
import type { Leaderboard } from "@/features/gamification/schemas"

/**
 * Renders the weekly leaderboard exactly as the database returned it. Entries
 * contain only an explorer name, avatar and XP; there are no ids to render.
 */
export function LeaderboardList({
  entries,
  className,
}: {
  entries: Leaderboard["entries"]
  className?: string
}) {
  return (
    <ol className={cn("grid gap-2", className)}>
      {entries.map((entry, index) => (
        <li
          key={`${entry.rank}-${entry.display_name}-${index}`}
          className={cn(
            "flex items-center gap-3 rounded-2xl px-3 py-2.5",
            entry.is_self ? "bg-electric-50 ring-2 ring-electric-300" : "bg-white ring-1 ring-ink-900/5"
          )}
        >
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl font-heading text-base font-bold",
              entry.rank === 1 ? "bg-sun-400 text-ink-900" : "bg-ink-100 text-ink-700"
            )}
          >
            <span className="sr-only">Rank </span>
            {entry.rank === 1 ? <Crown className="size-4" aria-hidden="true" /> : null}
            {entry.rank === 1 ? <span className="sr-only">1</span> : entry.rank}
          </span>
          <AvatarDisc avatarKey={entry.avatar_key} size="sm" />
          <span className="min-w-0 flex-1 truncate font-heading font-semibold text-ink-900">
            {entry.display_name}
            {entry.is_self ? <span className="ml-2 text-sm font-bold text-electric-700">(you)</span> : null}
          </span>
          <span className="font-heading font-bold text-ink-900">
            {entry.weekly_xp}
            <span className="text-sm font-semibold text-ink-500"> XP</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
