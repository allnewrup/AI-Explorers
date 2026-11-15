import Link from "next/link"
import {
  BookOpen,
  CalendarCheck,
  CircleCheck,
  CircleHelp,
  Eye,
  EyeOff,
  Flame,
  Pause,
  Target,
  Zap,
} from "lucide-react"
import { cn } from "cn"
import { EmptyState } from "@/components/feedback/empty-state"
import { AvatarDisc } from "@/components/gamification/avatar-disc"
import { StatTile } from "@/components/gamification/stats"
import { getWorldTheme } from "@/components/lessons/world-art"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AGE_BAND_LABELS, type AgeBand } from "@/config/age-bands"
import { getLevelProgress } from "@/config/gamification"
import { routes } from "@/config/site"
import type { ChildReport, HistoryItem } from "@/features/analytics/queries"
import { formatDate, formatDateTime, pluralise } from "@/lib/format"

export type ParentChild = {
  id: string
  displayName: string
  avatarKey: string
  ageBand: AgeBand
  isActive: boolean
  showOnLeaderboard: boolean
  createdAt: string
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const title = item.lessonTitle ?? "A lesson that is no longer published"
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-soft ring-1 ring-ink-900/5">
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
          item.kind === "lesson" ? "bg-electric-100 text-electric-700" : "bg-nebula-100 text-nebula-700"
        )}
      >
        {item.kind === "lesson" ? (
          <BookOpen className="size-4" aria-hidden="true" />
        ) : (
          <CircleHelp className="size-4" aria-hidden="true" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-heading font-semibold text-ink-900">
          {item.kind === "lesson" ? "Completed lesson: " : "Quiz: "}
          {title}
        </p>
        <p className="text-sm text-ink-500">
          {item.worldTitle ? `${item.worldTitle} · ` : ""}
          {formatDateTime(item.at)}
        </p>
      </div>
      {item.kind === "quiz" ? (
        <span className="shrink-0 text-right">
          <span className="block font-heading text-lg font-bold text-ink-900">{item.score}%</span>
          <span className="block text-xs text-ink-500">
            {item.correctAnswers}/{item.totalQuestions} correct
          </span>
        </span>
      ) : (
        <CircleCheck className="mt-1 size-5 shrink-0 text-aqua-700" aria-hidden="true" />
      )}
    </li>
  )
}

/**
 * Parent dashboard for one child. Presentational: every figure comes from
 * `getChildReport`, which reads stored rows. Where there is no activity the
 * page says so instead of showing zeros dressed up as insight.
 */
export function ParentReportView({
  parentName,
  childProfiles,
  selected,
  report,
  startLearningForm,
}: {
  parentName: string
  childProfiles: ParentChild[]
  selected: ParentChild
  report: ChildReport
  /** The "learn as this child" form (a server action), injected by the page. */
  startLearningForm?: React.ReactNode
}) {
  const { summary, worlds, history } = report
  const level = getLevelProgress(summary.total_xp)
  const hasActivity = summary.lessons_started > 0 || summary.quiz_attempts > 0 || summary.total_xp > 0
  const quietWeek =
    summary.weekly_xp === 0 && summary.weekly_lessons_completed === 0 && summary.weekly_quiz_attempts === 0

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">Hello, {parentName}</h1>
          <p className="mt-1 text-ink-500">Here is how your explorers are getting on.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={routes.parent.children}>Manage explorers</Link>
        </Button>
      </div>

      {childProfiles.length > 1 ? (
        <nav aria-label="Choose an explorer" className="flex flex-wrap gap-2">
          {childProfiles.map((child) => {
            const active = child.id === selected.id
            return (
              <Link
                key={child.id}
                href={`${routes.parent.dashboard}?child=${child.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl border-2 px-3 py-2 font-heading font-semibold transition-colors",
                  active
                    ? "border-electric-500 bg-electric-50 text-electric-700"
                    : "border-ink-200 bg-white text-ink-700 hover:border-electric-300"
                )}
              >
                <AvatarDisc avatarKey={child.avatarKey} size="xs" />
                {child.displayName}
              </Link>
            )
          })}
        </nav>
      ) : null}

      {/* Child profile */}
      <section
        aria-labelledby="child-heading"
        className="flex flex-col gap-5 rounded-4xl bg-white p-5 shadow-card ring-1 ring-ink-900/5 sm:flex-row sm:items-center sm:p-6"
      >
        <AvatarDisc avatarKey={selected.avatarKey} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 id="child-heading" className="text-2xl font-semibold text-ink-900">
            {selected.displayName}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="neutral">{AGE_BAND_LABELS[selected.ageBand]}</Badge>
            <Badge>
              Level {level.level} · {level.title}
            </Badge>
            {selected.isActive ? null : (
              <Badge variant="coral">
                <Pause aria-hidden="true" />
                Paused
              </Badge>
            )}
            <Badge variant={selected.showOnLeaderboard ? "aqua" : "outline"}>
              {selected.showOnLeaderboard ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
              {selected.showOnLeaderboard ? "On the leaderboard" : "Hidden from the leaderboard"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-ink-500">Profile created {formatDate(selected.createdAt)}</p>
        </div>
        {startLearningForm}
      </section>

      {/* Headline numbers */}
      <section aria-label="Totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<BookOpen aria-hidden="true" />}
          label="Lessons completed"
          value={summary.lessons_completed}
          hint={`${pluralise(summary.lessons_started, "lesson")} opened`}
          tone="electric"
        />
        <StatTile
          icon={<CircleHelp aria-hidden="true" />}
          label="Quiz attempts"
          value={summary.quiz_attempts}
          hint={`${pluralise(summary.quizzes_passed, "quiz", "quizzes")} passed`}
          tone="nebula"
        />
        <StatTile
          icon={<Target aria-hidden="true" />}
          label="Accuracy"
          value={summary.accuracy_percent === null ? "—" : `${summary.accuracy_percent}%`}
          hint={
            summary.accuracy_percent === null
              ? "No quiz answers yet"
              : `${summary.correct_answers} of ${summary.questions_answered} answers correct`
          }
          tone="aqua"
        />
        <StatTile
          icon={<Zap aria-hidden="true" />}
          label="Points earned"
          value={`${summary.total_xp} XP`}
          hint={`${pluralise(summary.achievements_earned, "badge")} earned`}
          tone="sun"
        />
      </section>

      {!hasActivity ? (
        <EmptyState
          title={`${selected.displayName} has not started yet`}
          description="Once a lesson is opened or a quiz is taken, real progress will appear here. Nothing on this page is estimated."
          action={startLearningForm}
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            {/* Weekly summary */}
            <section
              aria-labelledby="week-heading"
              className="rounded-3xl bg-ink-900 p-6 text-white shadow-card"
            >
              <h2 id="week-heading" className="flex items-center gap-2 text-2xl font-semibold">
                <CalendarCheck className="size-6 text-sun-400" aria-hidden="true" />
                This week
              </h2>
              <p className="mt-1 text-sm text-ink-200">Since Monday 00:00 UTC.</p>
              {quietWeek ? (
                <p className="mt-5 rounded-2xl bg-white/10 p-4 text-ink-100">
                  No learning activity recorded yet this week.
                </p>
              ) : (
                <dl className="mt-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "XP earned", value: summary.weekly_xp },
                    { label: "Lessons", value: summary.weekly_lessons_completed },
                    { label: "Quizzes", value: summary.weekly_quiz_attempts },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white/10 p-4 text-center">
                      <dt className="text-xs font-bold tracking-wide text-ink-200 uppercase">{item.label}</dt>
                      <dd className="font-heading text-3xl font-bold">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="mt-5 flex items-center gap-2 text-ink-100">
                <Flame className="size-5 text-coral-500" aria-hidden="true" />
                {summary.current_streak > 0
                  ? `Learning streak: ${pluralise(summary.current_streak, "day")} (best ${summary.longest_streak}).`
                  : summary.longest_streak > 0
                    ? `No current streak. Best so far: ${pluralise(summary.longest_streak, "day")}.`
                    : "No learning streak yet."}
              </p>
              <p className="mt-1 text-sm text-ink-300">
                Last learning day: {formatDate(summary.last_learning_date, "none yet")}
              </p>
            </section>

            {/* Category progress */}
            <section
              aria-labelledby="worlds-heading"
              className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-ink-900/5"
            >
              <h2 id="worlds-heading" className="text-2xl font-semibold text-ink-900">
                Progress by learning world
              </h2>
              {worlds.length > 0 ? (
                <ul className="mt-5 grid gap-4">
                  {worlds.map((world) => (
                    <li key={world.worldId}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="font-heading font-semibold text-ink-900">{world.title}</span>
                        <span className="shrink-0 text-sm font-bold text-ink-600">
                          {world.completed} of {world.total}
                        </span>
                      </div>
                      <Progress
                        value={world.completed}
                        max={Math.max(world.total, 1)}
                        label={`${world.title}: lessons completed`}
                        tone={getWorldTheme(world.imageKey).tone}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-ink-500">No learning worlds are published yet.</p>
              )}
            </section>
          </div>

          {/* Learning history */}
          <section aria-labelledby="history-heading">
            <h2 id="history-heading" className="mb-4 text-2xl font-semibold text-ink-900">
              Learning history
            </h2>
            {history.length > 0 ? (
              <ol className="grid gap-2">
                {history.map((item) => (
                  <HistoryRow key={item.id} item={item} />
                ))}
              </ol>
            ) : (
              <EmptyState
                compact
                title="No completed lessons or quizzes yet"
                description="Lessons that have been opened but not finished are not listed here."
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}
