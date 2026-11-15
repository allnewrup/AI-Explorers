import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { BookOpen, CircleHelp, Flame, Target, Zap } from "lucide-react"
import { EmptyState } from "@/components/feedback/empty-state"
import { DashboardSkeleton } from "@/components/feedback/skeletons"
import { AchievementBadge } from "@/components/gamification/achievement-badge"
import { LevelCard, StatTile, streakLabel } from "@/components/gamification/stats"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { getLevelProgress } from "@/config/gamification"
import { routes } from "@/config/site"
import { XP_EVENT_LABELS } from "@/features/gamification/labels"
import {
  getChildSummary,
  listAchievements,
  listXpTransactions,
} from "@/features/gamification/queries"
import { requireActiveChild } from "@/lib/auth/session"
import { formatDateTime } from "@/lib/format"

export const metadata: Metadata = { title: "My progress" }

export default function ProgressPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ProgressContent />
    </Suspense>
  )
}

async function ProgressContent() {
  const child = await requireActiveChild()
  const [summary, achievements, transactions] = await Promise.all([
    getChildSummary(child.id),
    listAchievements(child.id),
    listXpTransactions(child.id, 15),
  ])
  const level = getLevelProgress(summary.total_xp)

  return (
    <div className="grid gap-10">
      <PageHeader title="My progress" description="Everything you have learned and earned so far." />

      <LevelCard level={level} />

      <section aria-label="Your numbers" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={<Zap aria-hidden="true" />} label="Total XP" value={summary.total_xp} tone="sun" />
        <StatTile
          icon={<BookOpen aria-hidden="true" />}
          label="Lessons completed"
          value={summary.lessons_completed}
          tone="electric"
        />
        <StatTile
          icon={<CircleHelp aria-hidden="true" />}
          label="Quizzes passed"
          value={summary.quizzes_passed}
          hint={
            summary.accuracy_percent === null
              ? "No quiz answers yet"
              : `${summary.accuracy_percent}% of answers correct`
          }
          tone="nebula"
        />
        <StatTile
          icon={<Flame aria-hidden="true" />}
          label="Learning streak"
          value={summary.current_streak}
          hint={streakLabel(summary.current_streak)}
          tone="coral"
        />
      </section>

      <section aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="mb-4 text-2xl font-semibold">
          Badges
          <span className="ml-2 text-lg font-semibold text-ink-500">
            {summary.achievements_earned} of {achievements.length}
          </span>
        </h2>
        {achievements.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {achievements.map((achievement) => (
              <li key={achievement.id}>
                <AchievementBadge achievement={achievement} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState compact title="No badges to collect yet" />
        )}
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-4 text-2xl font-semibold">
          XP history
        </h2>
        {transactions.length > 0 ? (
          <ul className="grid gap-2">
            {transactions.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-ink-900/5"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-sun-100 text-sun-700">
                    <Target className="size-4" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-heading font-semibold text-ink-900">
                      {XP_EVENT_LABELS[item.eventType]}
                    </span>
                    <span className="block text-xs text-ink-500">{formatDateTime(item.createdAt)}</span>
                  </span>
                </span>
                <span className="font-heading text-lg font-bold text-aqua-700">+{item.points} XP</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No XP yet"
            description="Finish a lesson or take a quiz and your XP will show up here."
            action={
              <Button asChild>
                <Link href={routes.child.learn}>Find a lesson</Link>
              </Button>
            }
          />
        )}
      </section>
    </div>
  )
}
