import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  CircleHelp,
  Clock,
  Flame,
  Trophy,
  Zap,
} from "lucide-react"
import { EmptyState } from "@/components/feedback/empty-state"
import { AchievementBadge, type BadgeInfo } from "@/components/gamification/achievement-badge"
import { LeaderboardList } from "@/components/gamification/leaderboard-list"
import { LevelCard, streakLabel } from "@/components/gamification/stats"
import { SampleBadge, WorldCard } from "@/components/lessons/cards"
import { WorldArt } from "@/components/lessons/world-art"
import { Spark } from "@/components/mascot/spark"
import { SpeechBubble } from "@/components/mascot/speech-bubble"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LevelProgress } from "@/config/gamification"
import { routes, siteConfig } from "@/config/site"
import type { WorldWithProgress } from "@/features/curriculum/queries"
import type { ChildSummary, DailyChallenge, Leaderboard } from "@/features/gamification/schemas"
import type { PathLesson } from "@/features/lessons/learning-path"

export type QuizPreview = {
  lessonSlug: string
  lessonTitle: string
  questionCount: number
  firstQuestion: string
}

export type ChildDashboardData = {
  child: { displayName: string; avatarKey: string }
  level: LevelProgress
  summary: ChildSummary
  todaysLesson: PathLesson | null
  continueLesson: PathLesson | null
  /** False when no lessons are published at all. */
  hasLessons: boolean
  worlds: WorldWithProgress[]
  challenge: DailyChallenge
  quizPreview: QuizPreview | null
  achievements: BadgeInfo[]
  leaderboard: Leaderboard
}

function SectionTitle({
  id,
  children,
  action,
}: {
  id: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 id={id} className="text-2xl font-semibold text-ink-900">
        {children}
      </h2>
      {action}
    </div>
  )
}

function SeeAll({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 rounded font-heading font-semibold text-electric-700 underline-offset-4 hover:underline"
    >
      {children}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  )
}

function LessonSpotlight({
  eyebrow,
  lesson,
  cta,
}: {
  eyebrow: string
  lesson: PathLesson
  cta: string
}) {
  return (
    <div className="grid gap-4 rounded-4xl bg-white p-4 shadow-card ring-1 ring-ink-900/5 sm:grid-cols-[14rem_1fr] sm:p-5">
      <WorldArt imageKey={lesson.worldImageKey} className="h-36 sm:h-full" />
      <div className="flex flex-col gap-2 p-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="sun">{eyebrow}</Badge>
          <Badge variant="neutral">{lesson.worldTitle}</Badge>
          {lesson.isSample ? <SampleBadge /> : null}
        </div>
        <h3 className="text-2xl font-semibold text-ink-900">{lesson.title}</h3>
        <p className="text-ink-500">{lesson.description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
          <Button asChild size="lg" variant="playful">
            <Link href={routes.child.lesson(lesson.slug)}>
              {cta}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-600">
            <Clock className="size-4" aria-hidden="true" />
            About {lesson.estimatedMinutes} minutes
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * The child's home screen. Presentational: every number on it is passed in
 * from the database-backed queries in src/app/child/page.tsx.
 */
export function ChildDashboardView({ data }: { data: ChildDashboardData }) {
  const {
    child,
    level,
    summary,
    todaysLesson,
    continueLesson,
    hasLessons,
    worlds,
    challenge,
    quizPreview,
    achievements,
    leaderboard,
  } = data

  const earned = achievements.filter((item) => item.earnedAt !== null)
  const nextBadge = achievements.find((item) => item.earnedAt === null)
  const badgePreview = [...earned.slice(-2), ...(nextBadge ? [nextBadge] : [])]
  const allDone = hasLessons && todaysLesson === null

  return (
    <div className="grid gap-10">
      {/* Greeting */}
      <section
        aria-labelledby="greeting"
        className="relative isolate overflow-hidden rounded-4xl bg-ink-900 p-6 text-white sm:p-8"
      >
        <div className="bg-starfield absolute inset-0 -z-10" aria-hidden="true" />
        <div
          className="absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-electric-500/35 blur-3xl"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <Spark
            mood={allDone ? "celebrate" : "wave"}
            size={150}
            floating
            title={`${siteConfig.mascotName} the robot`}
          />
          <div className="flex-1 text-center md:text-left">
            <h1 id="greeting" className="text-3xl font-bold sm:text-4xl">
              Hi, {child.displayName}!
            </h1>
            <SpeechBubble tail="none" className="mt-3 inline-block text-left">
              <p className="font-heading text-lg font-semibold">
                {allDone
                  ? "You have finished every lesson. Incredible!"
                  : summary.lessons_completed === 0
                    ? "Welcome aboard! Ready for your first mission?"
                    : "Great to see you. Ready for today's mission?"}
              </p>
            </SpeechBubble>
          </div>
          <dl className="grid w-full grid-cols-3 gap-3 md:w-auto md:grid-cols-1 lg:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/15">
              <dt className="flex items-center justify-center gap-1 text-xs font-bold tracking-wide text-ink-200 uppercase">
                <Zap className="size-3.5" aria-hidden="true" />
                XP
              </dt>
              <dd className="font-heading text-2xl font-bold">{summary.total_xp}</dd>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/15">
              <dt className="flex items-center justify-center gap-1 text-xs font-bold tracking-wide text-ink-200 uppercase">
                <Trophy className="size-3.5" aria-hidden="true" />
                Level
              </dt>
              <dd className="font-heading text-2xl font-bold">{level.level}</dd>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/15">
              <dt className="flex items-center justify-center gap-1 text-xs font-bold tracking-wide text-ink-200 uppercase">
                <Flame className="size-3.5" aria-hidden="true" />
                Streak
              </dt>
              <dd className="font-heading text-2xl font-bold">
                {summary.current_streak}
                <span className="sr-only"> days</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Today's lesson + continue */}
      <section aria-labelledby="today">
        <SectionTitle id="today">Today&apos;s lesson</SectionTitle>
        {todaysLesson ? (
          <LessonSpotlight
            eyebrow={todaysLesson.progress === "in_progress" ? "Pick up where you left off" : "Up next"}
            lesson={todaysLesson}
            cta={todaysLesson.progress === "in_progress" ? "Continue lesson" : "Start lesson"}
          />
        ) : hasLessons ? (
          <EmptyState
            mood="celebrate"
            title="You have completed every lesson!"
            description="New lessons are on the way. Until then, try the daily challenge or retake a quiz to earn the XP you missed."
            action={
              <Button asChild>
                <Link href={routes.child.learn}>Browse the worlds</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No lessons yet"
            description="There are no published lessons to explore at the moment. Please check back soon."
          />
        )}
      </section>

      {continueLesson ? (
        <section aria-labelledby="continue">
          <SectionTitle id="continue">Continue learning</SectionTitle>
          <LessonSpotlight eyebrow="In progress" lesson={continueLesson} cta="Continue lesson" />
        </section>
      ) : null}

      {/* Daily challenge, quiz preview, level */}
      <section aria-label="Challenges and level" className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-3xl bg-sun-50 p-5 ring-1 ring-sun-100">
          <div className="flex items-center justify-between">
            <Badge variant="sun">
              <CalendarCheck aria-hidden="true" />
              Daily challenge
            </Badge>
            <span className="font-heading font-bold text-sun-700">+{challenge.xp_reward} XP</span>
          </div>
          {challenge.completed ? (
            <>
              <p className="flex items-center gap-2 font-heading text-xl font-semibold text-ink-900">
                <CircleCheck className="size-5 text-aqua-700" aria-hidden="true" />
                Done for today!
              </p>
              <p className="text-ink-600">Come back tomorrow for a new question.</p>
            </>
          ) : challenge.question ? (
            <>
              <p className="font-heading text-xl font-semibold text-ink-900">
                {challenge.question.question_text}
              </p>
              <p className="text-sm text-ink-600">One question. One answer. Can you get it?</p>
            </>
          ) : (
            <p className="text-ink-600">No challenge is available today.</p>
          )}
          <div className="mt-auto pt-2">
            <Button asChild variant={challenge.completed ? "outline" : "default"}>
              <Link href={routes.child.challenge}>
                {challenge.completed ? "See today's answer" : "Take the challenge"}
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl bg-nebula-50 p-5 ring-1 ring-nebula-100">
          <Badge variant="nebula">
            <CircleHelp aria-hidden="true" />
            Quiz preview
          </Badge>
          {quizPreview ? (
            <>
              <p className="font-heading text-xl font-semibold text-ink-900">
                {quizPreview.firstQuestion}
              </p>
              <p className="text-sm text-ink-600">
                The first of {quizPreview.questionCount} questions in the quiz for “
                {quizPreview.lessonTitle}”.
              </p>
              <div className="mt-auto pt-2">
                <Button asChild variant="secondary">
                  <Link href={routes.child.quiz(quizPreview.lessonSlug)}>Go to the quiz</Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-ink-600">
              Every lesson ends with a short quiz. Open a lesson to find its quiz.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <LevelCard level={level} className="flex-1" />
          <p className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-ink-700 shadow-soft ring-1 ring-ink-900/5">
            <Flame className="size-4 text-coral-600" aria-hidden="true" />
            {streakLabel(summary.current_streak)}
            {summary.longest_streak > 0 ? (
              <span className="font-semibold text-ink-500">· best {summary.longest_streak}</span>
            ) : null}
          </p>
        </div>
      </section>

      {/* Worlds */}
      <section aria-labelledby="worlds">
        <SectionTitle id="worlds" action={<SeeAll href={routes.child.learn}>All worlds</SeeAll>}>
          Learning worlds
        </SectionTitle>
        {worlds.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {worlds.slice(0, 3).map((world) => (
              <li key={world.id}>
                <WorldCard world={world} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState compact title="No worlds to explore yet" />
        )}
      </section>

      {/* Achievements + leaderboard */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="badges">
          <SectionTitle id="badges" action={<SeeAll href={routes.child.progress}>All badges</SeeAll>}>
            Badges
          </SectionTitle>
          {badgePreview.length > 0 ? (
            <ul className="grid gap-3">
              {badgePreview.map((achievement) => (
                <li key={achievement.badgeKey}>
                  <AchievementBadge achievement={achievement} compact />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact title="No badges to collect yet" />
          )}
        </section>

        <section aria-labelledby="leaders">
          <SectionTitle id="leaders" action={<SeeAll href={routes.child.leaderboard}>Full board</SeeAll>}>
            This week&apos;s leaders
          </SectionTitle>
          {leaderboard.entries.length > 0 ? (
            <LeaderboardList entries={leaderboard.entries.slice(0, 5)} />
          ) : (
            <EmptyState
              compact
              title="Nobody has earned XP yet this week"
              description="Finish a lesson or a quiz and you could be first on the board."
            />
          )}
        </section>
      </div>
    </div>
  )
}
