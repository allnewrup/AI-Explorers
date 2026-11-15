import "server-only"

import { getLearningPath, listActiveWorlds } from "@/features/curriculum/queries"
import { getChildSummary } from "@/features/gamification/queries"
import type { ChildSummary } from "@/features/gamification/schemas"
import { summariseWorldProgress } from "@/features/lessons/learning-path"
import { COLUMNS } from "@/lib/db-columns"
import { createClient } from "@/lib/supabase/server"

export type HistoryItem =
  | {
      kind: "lesson"
      id: string
      at: string
      lessonTitle: string | null
      worldTitle: string | null
    }
  | {
      kind: "quiz"
      id: string
      at: string
      lessonTitle: string | null
      worldTitle: string | null
      score: number
      correctAnswers: number
      totalQuestions: number
    }

export type WorldProgressRow = {
  worldId: string
  title: string
  imageKey: string
  completed: number
  total: number
}

export type ChildReport = {
  summary: ChildSummary
  worlds: WorldProgressRow[]
  history: HistoryItem[]
}

const HISTORY_LIMIT = 15

/**
 * Everything the parent dashboard shows for one child.
 *
 * Every figure is derived from rows stored by the scoring functions. Nothing
 * is estimated or filled in: with no activity the summary is all zeros,
 * accuracy is null and the history is empty, and the page says so.
 */
export async function getChildReport(childId: string): Promise<ChildReport> {
  const supabase = await createClient()

  const [summary, worlds, path, completions, attempts, quizzes] = await Promise.all([
    getChildSummary(childId),
    listActiveWorlds(),
    getLearningPath(childId),
    supabase
      .from("lesson_progress")
      .select(COLUMNS.lesson_progress)
      .eq("child_profile_id", childId)
      .eq("lesson_completed", true)
      .order("completed_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase
      .from("quiz_attempts")
      .select(COLUMNS.quiz_attempts)
      .eq("child_profile_id", childId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(HISTORY_LIMIT),
    supabase.from("quizzes").select(COLUMNS.quizzes),
  ])

  if (completions.error) throw new Error(`Could not load lesson history (${completions.error.code ?? "unknown"}).`)
  if (attempts.error) throw new Error(`Could not load quiz history (${attempts.error.code ?? "unknown"}).`)
  if (quizzes.error) throw new Error(`Could not load quizzes (${quizzes.error.code ?? "unknown"}).`)

  // Titles come from lessons the parent can currently see. A lesson that has
  // since been unpublished keeps its history row but shows no title.
  const lessonById = new Map(path.map((lesson) => [lesson.id, lesson]))
  const lessonIdByQuiz = new Map(quizzes.data.map((quiz) => [quiz.id, quiz.lesson_id]))

  const history: HistoryItem[] = [
    ...completions.data.flatMap((row): HistoryItem[] => {
      if (!row.completed_at) return []
      const lesson = lessonById.get(row.lesson_id)
      return [
        {
          kind: "lesson",
          id: `lesson-${row.lesson_id}`,
          at: row.completed_at,
          lessonTitle: lesson?.title ?? null,
          worldTitle: lesson?.worldTitle ?? null,
        },
      ]
    }),
    ...attempts.data.flatMap((row): HistoryItem[] => {
      if (!row.completed_at) return []
      const lesson = lessonById.get(lessonIdByQuiz.get(row.quiz_id) ?? "")
      return [
        {
          kind: "quiz",
          id: `quiz-${row.id}`,
          at: row.completed_at,
          lessonTitle: lesson?.title ?? null,
          worldTitle: lesson?.worldTitle ?? null,
          score: row.score,
          correctAnswers: row.correct_answers,
          totalQuestions: row.total_questions,
        },
      ]
    }),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, HISTORY_LIMIT)

  const progress = summariseWorldProgress(path)

  return {
    summary,
    worlds: worlds.map((world) => ({
      worldId: world.id,
      title: world.title,
      imageKey: world.imageKey,
      completed: progress.get(world.id)?.completed ?? 0,
      total: progress.get(world.id)?.total ?? 0,
    })),
    history,
  }
}
