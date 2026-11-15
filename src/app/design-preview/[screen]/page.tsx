import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { FlaskConical } from "lucide-react"
import { LessonEditor } from "@/components/admin/lesson-editor"
import { ChildDashboardView } from "@/components/dashboards/child-dashboard-view"
import { ParentReportView } from "@/components/dashboards/parent-report-view"
import { EmptyState } from "@/components/feedback/empty-state"
import { ErrorState } from "@/components/feedback/error-state"
import { SetupRequired } from "@/components/feedback/setup-required"
import { DashboardSkeleton } from "@/components/feedback/skeletons"
import { AchievementBadge } from "@/components/gamification/achievement-badge"
import { LeaderboardList } from "@/components/gamification/leaderboard-list"
import { LevelCard } from "@/components/gamification/stats"
import { ChildIdentity, ChildTopBar } from "@/components/layout/child-top-bar"
import { ChildNav } from "@/components/navigation/child-nav"
import { PageHeader } from "@/components/layout/page-header"
import { LessonCard, WorldCard } from "@/components/lessons/cards"
import { LessonView } from "@/components/lessons/lesson-view"
import { QuizReview } from "@/components/quizzes/quiz-review"
import { Button } from "@/components/ui/button"
import {
  emptyDashboard,
  emptyReport,
  sampleAchievements,
  sampleAttempt,
  sampleChallenge,
  sampleChild,
  sampleDashboard,
  sampleLeaderboard,
  sampleLesson,
  sampleLessonInput,
  samplePath,
  sampleQuiz,
  sampleQuizKey,
  sampleReport,
  sampleSibling,
  sampleWorlds,
} from "../fixtures"
import { PreviewChallenge, PreviewLessonActions, PreviewQuiz } from "../preview-interactive"

/**
 * Development-only gallery of the signed-in screens, rendered with invented
 * sample data. It exists because those screens otherwise need a Supabase
 * project to be seen at all.
 *
 * It is not part of the product: every path here returns 404 in production
 * builds, and it never reads or writes a database.
 */

const SCREENS = [
  "child-dashboard",
  "child-dashboard-new",
  "learn",
  "world",
  "lesson",
  "quiz",
  "quiz-review",
  "challenge",
  "progress",
  "leaderboard",
  "parent",
  "parent-new",
  "admin-editor",
  "states",
  "setup-required",
] as const

type Screen = (typeof SCREENS)[number]

export const metadata: Metadata = { title: "Design preview", robots: { index: false } }


export function generateStaticParams() {
  return SCREENS.map((screen) => ({ screen }))
}

const isEnabled = process.env.NODE_ENV !== "production"

function PreviewBanner({ current }: { current: Screen }) {
  return (
    <div className="border-b-2 border-sun-500 bg-sun-100 text-ink-900">
      <div className="container-page flex flex-col gap-2 py-3 text-sm">
        <p className="flex items-center gap-2 font-bold">
          <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
          Design preview. Invented sample data, not connected to any account or database.
        </p>
        <nav aria-label="Preview screens" className="flex flex-wrap gap-x-3 gap-y-1">
          {SCREENS.map((screen) => (
            <Link
              key={screen}
              href={`/design-preview/${screen}`}
              aria-current={screen === current ? "page" : undefined}
              className={
                screen === current
                  ? "rounded font-bold text-electric-700 underline underline-offset-4"
                  : "rounded text-ink-700 underline-offset-4 hover:underline"
              }
            >
              {screen}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

function ChildFrame({ children, xp = 165, streak = 3 }: { children: React.ReactNode; xp?: number; streak?: number }) {
  return (
    <div className="flex flex-1 flex-col bg-mist">
      <ChildTopBar
        identity={
          <ChildIdentity
            displayName={sampleChild.displayName}
            avatarKey={sampleChild.avatarKey}
            totalXp={xp}
            streak={streak}
          />
        }
      />
      <main id="main-content" className="container-page flex-1 py-6 pb-28 sm:py-8 sm:pb-28 lg:pb-12">
        {children}
      </main>
      <Suspense fallback={null}>
        <ChildNav variant="bottom" />
      </Suspense>
    </div>
  )
}

function AdultFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-mist">
      <main id="main-content" className="container-page flex-1 py-8">
        {children}
      </main>
    </div>
  )
}

function renderScreen(screen: Screen) {
  switch (screen) {
    case "child-dashboard":
      return (
        <ChildFrame>
          <ChildDashboardView data={sampleDashboard} />
        </ChildFrame>
      )
    case "child-dashboard-new":
      return (
        <ChildFrame xp={0} streak={0}>
          <ChildDashboardView data={emptyDashboard} />
        </ChildFrame>
      )
    case "learn":
      return (
        <ChildFrame>
          <div className="grid gap-8">
            <PageHeader
              title="Learning worlds"
              description="Pick a world to explore. Each one is full of short lessons and quizzes."
            />
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sampleWorlds.map((world) => (
                <li key={world.id}>
                  <WorldCard world={world} />
                </li>
              ))}
            </ul>
          </div>
        </ChildFrame>
      )
    case "world":
      return (
        <ChildFrame>
          <div className="grid gap-6">
            <PageHeader title="AI Beginners" description="Lessons in this world." />
            <ol className="grid gap-4">
              {samplePath.slice(0, 5).map((lesson, index) => (
                <li key={lesson.id}>
                  <LessonCard lesson={lesson} index={index} />
                </li>
              ))}
            </ol>
          </div>
        </ChildFrame>
      )
    case "lesson":
      return (
        <ChildFrame>
          <LessonView
            lesson={sampleLesson}
            media={{ state: "pending" }}
            trackProgress={false}
            footer={<PreviewLessonActions lessonId={sampleLesson.id ?? ""} />}
          />
        </ChildFrame>
      )
    case "quiz":
      return (
        <ChildFrame>
          <PreviewQuiz
            quiz={sampleQuiz}
            answerKey={sampleQuizKey}
            lessonTitle={sampleLesson.title}
            lessonSlug="what-is-artificial-intelligence"
          />
        </ChildFrame>
      )
    case "quiz-review":
      return (
        <ChildFrame>
          <QuizReview attempt={sampleAttempt} lessonTitle={sampleLesson.title} />
        </ChildFrame>
      )
    case "challenge":
      return (
        <ChildFrame>
          <div className="mx-auto grid max-w-2xl gap-6">
            <PageHeader title="Daily challenge" description="One question every day." />
            <PreviewChallenge challenge={sampleChallenge} answerKey={sampleQuizKey} />
          </div>
        </ChildFrame>
      )
    case "progress":
      return (
        <ChildFrame>
          <div className="grid gap-8">
            <PageHeader title="My progress" description="Everything you have learned and earned so far." />
            <LevelCard level={sampleDashboard.level} />
            <ul className="grid gap-4 md:grid-cols-2">
              {sampleAchievements.map((achievement) => (
                <li key={achievement.badgeKey}>
                  <AchievementBadge achievement={achievement} />
                </li>
              ))}
            </ul>
          </div>
        </ChildFrame>
      )
    case "leaderboard":
      return (
        <ChildFrame>
          <div className="mx-auto grid max-w-2xl gap-6">
            <PageHeader title="Weekly leaderboard" description="Ranked by XP earned this week." />
            <LeaderboardList entries={sampleLeaderboard.entries} />
          </div>
        </ChildFrame>
      )
    case "parent":
      return (
        <AdultFrame>
          <ParentReportView
            parentName="Sam"
            childProfiles={[sampleChild, sampleSibling]}
            selected={sampleChild}
            report={sampleReport}
            startLearningForm={<Button variant="playful" size="lg">Learn as {sampleChild.displayName}</Button>}
          />
        </AdultFrame>
      )
    case "parent-new":
      return (
        <AdultFrame>
          <ParentReportView
            parentName="Sam"
            childProfiles={[sampleSibling]}
            selected={sampleSibling}
            report={emptyReport}
            startLearningForm={<Button variant="playful" size="lg">Learn as {sampleSibling.displayName}</Button>}
          />
        </AdultFrame>
      )
    case "admin-editor":
      return (
        <AdultFrame>
          <LessonEditor
            lessonId={null}
            status="draft"
            initialValues={sampleLessonInput}
            worlds={sampleWorlds.map((world) => ({ id: world.id, title: world.title, isActive: true }))}
            versions={[
              { version_number: 2, created_at: "2026-11-14T12:00:00Z", changed_by_name: "Content Admin", status: "draft" },
              { version_number: 1, created_at: "2026-11-10T09:00:00Z", changed_by_name: null, status: "draft" },
            ]}
          />
        </AdultFrame>
      )
    case "states":
      return (
        <AdultFrame>
          <div className="grid gap-10">
            <section className="grid gap-4">
              <h2 className="text-2xl font-semibold">Empty state</h2>
              <EmptyState
                title="No XP yet"
                description="Finish a lesson or take a quiz and your XP will show up here."
                action={<Button>Find a lesson</Button>}
              />
            </section>
            <section className="grid gap-4">
              <h2 className="text-2xl font-semibold">Error state</h2>
              <ErrorState action={<Button>Try again</Button>} />
            </section>
            <section className="grid gap-4">
              <h2 className="text-2xl font-semibold">Loading state</h2>
              <DashboardSkeleton />
            </section>
          </div>
        </AdultFrame>
      )
    case "setup-required":
      return <SetupRequired area="The explorer area" />
  }
}

export default function DesignPreviewPage({ params }: PageProps<"/design-preview/[screen]">) {
  return (
    <Suspense fallback={<div className="flex-1 bg-mist" />}>
      <PreviewContent params={params} />
    </Suspense>
  )
}

async function PreviewContent({ params }: Pick<PageProps<"/design-preview/[screen]">, "params">) {
  if (!isEnabled) notFound()

  const { screen } = await params
  if (!(SCREENS as readonly string[]).includes(screen)) notFound()

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PreviewBanner current={screen as Screen} />
      {renderScreen(screen as Screen)}
    </div>
  )
}
