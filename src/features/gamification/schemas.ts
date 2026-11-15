import { z } from "zod"
import { achievementSchema } from "@/features/lessons/schemas"

/** Result of `get_child_summary`. */
export const childSummarySchema = z.object({
  total_xp: z.number().int().min(0),
  weekly_xp: z.number().int().min(0),
  lessons_started: z.number().int().min(0),
  lessons_completed: z.number().int().min(0),
  weekly_lessons_completed: z.number().int().min(0),
  quiz_attempts: z.number().int().min(0),
  weekly_quiz_attempts: z.number().int().min(0),
  quizzes_passed: z.number().int().min(0),
  questions_answered: z.number().int().min(0),
  correct_answers: z.number().int().min(0),
  // NULL until at least one question has been answered: "no data", not 0%.
  accuracy_percent: z.number().int().min(0).max(100).nullable(),
  current_streak: z.number().int().min(0),
  longest_streak: z.number().int().min(0),
  last_learning_date: z.string().nullable(),
  achievements_earned: z.number().int().min(0),
})

export type ChildSummary = z.infer<typeof childSummarySchema>

/** Result of `get_weekly_leaderboard`. Contains no ids of other children. */
export const leaderboardSchema = z.object({
  week_start: z.string(),
  entries: z.array(
    z.object({
      rank: z.number().int().min(1),
      display_name: z.string(),
      avatar_key: z.string(),
      weekly_xp: z.number().int().min(0),
      is_self: z.boolean(),
    })
  ),
  self: z.object({
    rank: z.number().int().min(1).nullable(),
    weekly_xp: z.number().int().min(0),
    visible_to_others: z.boolean(),
    display_name: z.string(),
    avatar_key: z.string(),
  }),
})

export type Leaderboard = z.infer<typeof leaderboardSchema>

const challengeQuestionSchema = z.object({
  id: z.uuid(),
  question_text: z.string(),
  lesson_title: z.string(),
  lesson_slug: z.string(),
  options: z.array(z.object({ id: z.uuid(), option_text: z.string() })),
})

const challengeResultSchema = z.object({
  selected_option_id: z.uuid().nullable(),
  is_correct: z.boolean(),
  correct_option_id: z.uuid().nullable(),
  explanation: z.string(),
})

/** Result of `get_daily_challenge`. */
export const dailyChallengeSchema = z.object({
  challenge_date: z.string(),
  xp_reward: z.number().int().min(0),
  available: z.boolean(),
  completed: z.boolean(),
  question: challengeQuestionSchema.nullable(),
  result: challengeResultSchema.nullable(),
})

export type DailyChallenge = z.infer<typeof dailyChallengeSchema>

/** Result of `submit_daily_challenge`. */
export const dailyChallengeSubmissionSchema = dailyChallengeSchema.extend({
  points_awarded: z.number().int().min(0),
  total_xp: z.number().int().min(0),
  new_achievements: z.array(achievementSchema),
  already_completed: z.boolean(),
})

export type DailyChallengeSubmission = z.infer<typeof dailyChallengeSubmissionSchema>
