import "server-only"

import { COLUMNS } from "@/lib/db-columns"
import { createClient } from "@/lib/supabase/server"

export type AttemptReview = {
  id: string
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  completedAt: string
  passingScore: number
  passed: boolean
  responses: {
    id: string
    isCorrect: boolean
    questionText: string
    selectedOptionText: string
    correctOptionText: string
  }[]
}

/**
 * A finished attempt with the child's answers, read back from the database.
 *
 * `childId` narrows the lookup to the active child; row-level security has
 * already limited it to the signed-in parent's children. The question and
 * answer texts are the snapshots stored when the child answered, so the review
 * stays accurate after a lesson is edited.
 */
export async function getCompletedAttempt(
  childId: string,
  attemptId: string
): Promise<AttemptReview | null> {
  const supabase = await createClient()
  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .select(COLUMNS.quiz_attempts)
    .eq("id", attemptId)
    .eq("child_profile_id", childId)
    .maybeSingle()

  if (error) throw new Error(`Could not load the quiz attempt (${error.code ?? "unknown"}).`)
  if (!attempt || !attempt.completed_at) return null

  const [responsesResult, quizResult] = await Promise.all([
    supabase
      .from("quiz_responses")
      .select(COLUMNS.quiz_responses)
      .eq("attempt_id", attempt.id)
      .order("answered_at", { ascending: true }),
    supabase.from("quizzes").select(COLUMNS.quizzes).eq("id", attempt.quiz_id).maybeSingle(),
  ])

  if (responsesResult.error) {
    throw new Error(`Could not load quiz answers (${responsesResult.error.code ?? "unknown"}).`)
  }

  const passingScore = quizResult.data?.passing_score ?? 60

  return {
    id: attempt.id,
    quizId: attempt.quiz_id,
    score: attempt.score,
    totalQuestions: attempt.total_questions,
    correctAnswers: attempt.correct_answers,
    completedAt: attempt.completed_at,
    passingScore,
    passed: attempt.score >= passingScore,
    responses: responsesResult.data.map((row) => ({
      id: row.id,
      isCorrect: row.is_correct,
      questionText: row.question_text,
      selectedOptionText: row.selected_option_text,
      correctOptionText: row.correct_option_text,
    })),
  }
}
