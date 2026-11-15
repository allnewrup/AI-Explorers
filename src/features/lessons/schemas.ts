import { z } from "zod"

export const keyTermsSchema = z.array(
  z.object({
    term: z.string(),
    definition: z.string(),
  })
)

export type KeyTerm = z.infer<typeof keyTermsSchema>[number]

export const achievementSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string(),
  badge_key: z.string(),
})

export type NewAchievement = z.infer<typeof achievementSchema>

/** Result of `complete_lesson`. */
export const lessonCompletionSchema = z.object({
  points_awarded: z.number().int().min(0),
  already_completed: z.boolean(),
  total_xp: z.number().int().min(0),
  new_achievements: z.array(achievementSchema),
})

export type LessonCompletion = z.infer<typeof lessonCompletionSchema>
