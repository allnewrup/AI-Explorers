import type { Metadata } from "next"
import { Suspense } from "react"
import {
  ChildDashboardView,
  type QuizPreview,
} from "@/components/dashboards/child-dashboard-view"
import { DashboardSkeleton } from "@/components/feedback/skeletons"
import { getLevelProgress } from "@/config/gamification"
import { getLearningPath, listWorldsWithProgress } from "@/features/curriculum/queries"
import {
  getChildSummary,
  getDailyChallenge,
  getWeeklyLeaderboard,
  listAchievements,
} from "@/features/gamification/queries"
import { pickContinueLesson, pickNextLesson } from "@/features/lessons/learning-path"
import { getQuizForLesson } from "@/features/lessons/queries"
import { requireActiveChild } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Explorer home" }

export default function ChildDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ChildDashboard />
    </Suspense>
  )
}

async function ChildDashboard() {
  const child = await requireActiveChild()

  const [summary, path, worlds, challenge, achievements, leaderboard] = await Promise.all([
    getChildSummary(child.id),
    getLearningPath(child.id),
    listWorldsWithProgress(child.id),
    getDailyChallenge(child.id),
    listAchievements(child.id),
    getWeeklyLeaderboard(child.id, 5),
  ])

  const todaysLesson = pickNextLesson(path)
  const continueLesson = pickContinueLesson(path, todaysLesson)

  let quizPreview: QuizPreview | null = null
  if (todaysLesson) {
    const quiz = await getQuizForLesson(todaysLesson.id)
    const first = quiz?.questions[0]
    if (quiz && first) {
      quizPreview = {
        lessonSlug: todaysLesson.slug,
        lessonTitle: todaysLesson.title,
        questionCount: quiz.questions.length,
        firstQuestion: first.text,
      }
    }
  }

  return (
    <ChildDashboardView
      data={{
        child: { displayName: child.displayName, avatarKey: child.avatarKey },
        level: getLevelProgress(summary.total_xp),
        summary,
        todaysLesson,
        continueLesson,
        hasLessons: path.length > 0,
        worlds,
        challenge,
        quizPreview,
        achievements,
        leaderboard,
      }}
    />
  )
}
