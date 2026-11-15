"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { fail, ok, type ActionResult } from "@/lib/action-result"
import { getActiveChild } from "@/lib/auth/session"
import { describeDbError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import { parseRpc } from "@/lib/validation/rpc"
import {
  answerFeedbackSchema,
  answerInputSchema,
  quizResultSchema,
  quizStartSchema,
  type AnswerFeedback,
  type QuizResult,
  type QuizStart,
} from "./schemas"

const NO_CHILD = "Choose an explorer profile first."

/**
 * The quiz flow, as three server actions.
 *
 * The browser sends only ids: which quiz, which question, which option. It
 * never sends a score, never says whether an answer was right, and never
 * receives the answer key before answering. All of that is decided by the
 * database functions these actions call.
 */

export async function startQuizAction(quizId: string): Promise<ActionResult<QuizStart>> {
  const parsed = z.uuid().safeParse(quizId)
  if (!parsed.success) return fail("That quiz could not be found.")

  const child = await getActiveChild()
  if (!child) return fail(NO_CHILD)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("start_quiz_attempt", {
    p_child_id: child.id,
    p_quiz_id: parsed.data,
  })
  if (error) return fail(describeDbError(error))

  return ok(parseRpc(quizStartSchema, data, "start_quiz_attempt"))
}

export async function answerQuestionAction(input: {
  attemptId: string
  questionId: string
  optionId: string
}): Promise<ActionResult<AnswerFeedback>> {
  const parsed = answerInputSchema.safeParse(input)
  if (!parsed.success) return fail("That answer could not be read. Please try again.")

  // The database function checks that the attempt belongs to one of the
  // caller's children; this check simply gives a friendlier message first.
  const child = await getActiveChild()
  if (!child) return fail(NO_CHILD)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("answer_quiz_question", {
    p_attempt_id: parsed.data.attemptId,
    p_question_id: parsed.data.questionId,
    p_option_id: parsed.data.optionId,
  })
  if (error) return fail(describeDbError(error))

  return ok(parseRpc(answerFeedbackSchema, data, "answer_quiz_question"))
}

export async function completeQuizAction(attemptId: string): Promise<ActionResult<QuizResult>> {
  const parsed = z.uuid().safeParse(attemptId)
  if (!parsed.success) return fail("That quiz attempt could not be found.")

  const child = await getActiveChild()
  if (!child) return fail(NO_CHILD)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("complete_quiz_attempt", {
    p_attempt_id: parsed.data,
  })
  if (error) return fail(describeDbError(error))

  revalidatePath("/", "layout")
  return ok(parseRpc(quizResultSchema, data, "complete_quiz_attempt"))
}
