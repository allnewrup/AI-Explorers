import { seedIds } from "../../../supabase/seed/build-seed"
import type { TestDatabase } from "./db"

export const LESSON_A = "what-is-artificial-intelligence"
export const LESSON_B = "can-machines-think-like-humans"
export const LESSON_C = "can-ai-make-mistakes"

export type Families = {
  parentA: string
  parentB: string
  admin: string
  childA: string
  childB: string
}

/** Two unrelated families and one administrator. */
export async function createFamilies(db: TestDatabase): Promise<Families> {
  const parentA = await db.createUser("parent-a@example.test", { display_name: "Parent A" })
  const parentB = await db.createUser("parent-b@example.test", { display_name: "Parent B" })
  const admin = await db.createUser("admin@example.test", { display_name: "Content Admin" })
  await db.makeAdmin(admin)
  const childA = await db.createChild(parentA, { displayName: "CosmicOtter42" })
  const childB = await db.createChild(parentB, { displayName: "BravePanda17" })
  return { parentA, parentB, admin, childA, childB }
}

export type QuizKey = {
  lessonId: string
  quizId: string
  questions: {
    id: string
    correctOptionId: string
    wrongOptionId: string
    optionIds: string[]
  }[]
}

/** Reads a seeded quiz including its answer key (superuser only). */
export async function getQuizKey(db: TestDatabase, lessonSlug: string): Promise<QuizKey> {
  const lessonId = seedIds.lesson(lessonSlug)
  const quizId = seedIds.quiz(lessonSlug)
  const rows = await db.admin<{ question_id: string; option_id: string; is_correct: boolean }>(
    `select qq.id as question_id, o.id as option_id, o.is_correct
     from public.quiz_questions qq
     join public.quiz_options o on o.question_id = qq.id
     where qq.quiz_id = $1
     order by qq.display_order, o.display_order`,
    [quizId]
  )
  const byQuestion = new Map<string, { id: string; isCorrect: boolean }[]>()
  for (const row of rows) {
    const list = byQuestion.get(row.question_id) ?? []
    list.push({ id: row.option_id, isCorrect: row.is_correct })
    byQuestion.set(row.question_id, list)
  }
  const questions = [...byQuestion.entries()].map(([id, options]) => {
    const correct = options.find((option) => option.isCorrect)
    const wrong = options.find((option) => !option.isCorrect)
    if (!correct || !wrong) throw new Error(`question ${id} has no usable answer key`)
    return {
      id,
      correctOptionId: correct.id,
      wrongOptionId: wrong.id,
      optionIds: options.map((option) => option.id),
    }
  })
  return { lessonId, quizId, questions }
}

export type AttemptResult = {
  attempt_id: string
  score: number
  total_questions: number
  correct_answers: number
  passing_score: number
  passed: boolean
  points_awarded: number
  total_xp: number
  new_achievements: { badge_key: string }[]
  already_completed: boolean
}

/**
 * Plays a whole quiz as a child would: start, answer every question, finish.
 * `correctCount` questions are answered correctly, the rest incorrectly.
 */
export async function playQuiz(
  db: TestDatabase,
  parentId: string,
  childId: string,
  quiz: QuizKey,
  correctCount: number
): Promise<AttemptResult> {
  const started = await db.rpc<{ attempt_id: string }>(parentId, "start_quiz_attempt", [
    childId,
    quiz.quizId,
  ])
  for (const [index, question] of quiz.questions.entries()) {
    await db.rpc(parentId, "answer_quiz_question", [
      started.attempt_id,
      question.id,
      index < correctCount ? question.correctOptionId : question.wrongOptionId,
    ])
  }
  return db.rpc<AttemptResult>(parentId, "complete_quiz_attempt", [started.attempt_id])
}

export async function totalXp(db: TestDatabase, childId: string): Promise<number> {
  const rows = await db.admin<{ total: number }>(
    "select coalesce(sum(points), 0)::int as total from public.points_ledger where child_profile_id = $1",
    [childId]
  )
  return rows[0]?.total ?? 0
}

export async function ledgerCount(db: TestDatabase, childId: string): Promise<number> {
  const rows = await db.admin<{ n: number }>(
    "select count(*)::int as n from public.points_ledger where child_profile_id = $1",
    [childId]
  )
  return rows[0]?.n ?? 0
}
