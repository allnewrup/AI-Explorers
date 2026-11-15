import { z } from "zod"
import { achievementSchema } from "@/features/lessons/schemas"

/** Server verdict on one answer (from `answer_quiz_question`). */
export const answerFeedbackSchema = z.object({
  question_id: z.uuid(),
  // NULL only if an administrator deleted the option after it was chosen.
  selected_option_id: z.uuid().nullable(),
  is_correct: z.boolean(),
  correct_option_id: z.uuid().nullable(),
  explanation: z.string(),
  already_answered: z.boolean().optional(),
})

export type AnswerFeedback = z.infer<typeof answerFeedbackSchema>

/** Result of `start_quiz_attempt`: the attempt plus any answers already given. */
export const quizStartSchema = z.object({
  attempt_id: z.uuid(),
  answered: z.array(answerFeedbackSchema),
})

export type QuizStart = z.infer<typeof quizStartSchema>

/** Result of `complete_quiz_attempt`. */
export const quizResultSchema = z.object({
  attempt_id: z.uuid(),
  score: z.number().int().min(0).max(100),
  total_questions: z.number().int().min(1),
  correct_answers: z.number().int().min(0),
  passing_score: z.number().int().min(0).max(100),
  passed: z.boolean(),
  points_awarded: z.number().int().min(0),
  total_xp: z.number().int().min(0),
  new_achievements: z.array(achievementSchema),
  already_completed: z.boolean(),
})

export type QuizResult = z.infer<typeof quizResultSchema>

export const answerInputSchema = z.object({
  attemptId: z.uuid(),
  questionId: z.uuid(),
  optionId: z.uuid(),
})
