"use client"

import { LessonActions } from "@/components/lessons/lesson-actions"
import { DailyChallengePlayer } from "@/components/quizzes/daily-challenge"
import { QuizPlayer, type QuizActions } from "@/components/quizzes/quiz-player"
import { XP_RULES } from "@/config/gamification"
import type { DailyChallenge } from "@/features/gamification/schemas"
import type { QuizForPlay } from "@/features/lessons/queries"

/**
 * Stand-ins for the server actions, used ONLY by the design preview so the
 * interactive screens can be clicked through without a database.
 *
 * In the real app these decisions are made by PostgreSQL functions. Here a
 * small in-browser object plays that role; it is never imported by a real page.
 */

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms))
const ATTEMPT_ID = "00000000-0000-4000-8000-000000009999"

function makeQuizActions(
  quiz: QuizForPlay,
  key: Record<string, { correctOptionId: string; explanation: string }>
): QuizActions {
  const answers = new Map<string, boolean>()
  return {
    async start() {
      await wait()
      answers.clear()
      return { ok: true, data: { attempt_id: ATTEMPT_ID, answered: [] } }
    },
    async answer({ questionId, optionId }) {
      await wait()
      const entry = key[questionId]
      if (!entry) return { ok: false, error: "That question is not part of this quiz." }
      const isCorrect = entry.correctOptionId === optionId
      answers.set(questionId, isCorrect)
      return {
        ok: true,
        data: {
          question_id: questionId,
          selected_option_id: optionId,
          is_correct: isCorrect,
          correct_option_id: entry.correctOptionId,
          explanation: entry.explanation,
          already_answered: false,
        },
      }
    },
    async complete() {
      await wait()
      const total = quiz.questions.length
      const correct = [...answers.values()].filter(Boolean).length
      const score = Math.round((correct / total) * 100)
      return {
        ok: true,
        data: {
          attempt_id: ATTEMPT_ID,
          score,
          total_questions: total,
          correct_answers: correct,
          passing_score: quiz.passingScore,
          passed: score >= quiz.passingScore,
          points_awarded: XP_RULES.quizCompleted + correct * XP_RULES.quizCorrectAnswer,
          total_xp: 165 + XP_RULES.quizCompleted + correct * XP_RULES.quizCorrectAnswer,
          new_achievements: [],
          already_completed: false,
        },
      }
    },
  }
}

export function PreviewQuiz({
  quiz,
  answerKey,
  lessonTitle,
  lessonSlug,
}: {
  quiz: QuizForPlay
  answerKey: Record<string, { correctOptionId: string; explanation: string }>
  lessonTitle: string
  lessonSlug: string
}) {
  return (
    <QuizPlayer
      quiz={quiz}
      lessonTitle={lessonTitle}
      lessonSlug={lessonSlug}
      actions={makeQuizActions(quiz, answerKey)}
    />
  )
}

export function PreviewChallenge({
  challenge,
  answerKey,
}: {
  challenge: DailyChallenge
  answerKey: Record<string, { correctOptionId: string; explanation: string }>
}) {
  return (
    <DailyChallengePlayer
      challenge={challenge}
      submit={async (optionId) => {
        await wait()
        const entry = challenge.question ? answerKey[challenge.question.id] : undefined
        return {
          ok: true,
          data: {
            ...challenge,
            completed: true,
            result: {
              selected_option_id: optionId,
              is_correct: entry?.correctOptionId === optionId,
              correct_option_id: entry?.correctOptionId ?? null,
              explanation: entry?.explanation ?? "",
            },
            points_awarded: challenge.xp_reward,
            total_xp: 180,
            new_achievements: [],
            already_completed: false,
          },
        }
      }}
    />
  )
}

export function PreviewLessonActions({ lessonId }: { lessonId: string }) {
  return (
    <LessonActions
      lessonId={lessonId}
      quizHref="/design-preview/quiz"
      hasQuiz
      questionCount={5}
      initiallyCompleted={false}
      complete={async () => {
        await wait()
        return {
          ok: true,
          data: {
            points_awarded: XP_RULES.lessonCompleted,
            already_completed: false,
            total_xp: 175,
            new_achievements: [],
          },
        }
      }}
    />
  )
}
