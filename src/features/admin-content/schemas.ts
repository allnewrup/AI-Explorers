import { z } from "zod"
import { AGE_BANDS } from "@/config/age-bands"
import { WORLD_IMAGE_KEYS } from "@/config/worlds"

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const
export const LESSON_STATUSES = ["draft", "published", "archived"] as const

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const slug = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Add a URL name.")
    .max(max, `Use ${max} characters or fewer.`)
    .regex(SLUG, "Use lowercase letters, numbers and single hyphens only.")

/** A list of short lines; blank entries are dropped. */
const lines = (label: string, maxItems = 12) =>
  z
    .array(z.string().trim().max(300, `Keep each ${label} under 300 characters.`))
    .max(maxItems, `Use at most ${maxItems} items.`)
    .transform((items) => items.filter((item) => item.length > 0))

const optionalKey = z
  .string()
  .trim()
  .max(300, "Use 300 characters or fewer.")
  .refine((value) => !value.startsWith("/") && !value.includes(".."), "Use a storage path such as lessons/intro.mp4.")

const quizOptionInput = z.object({
  id: z.uuid().optional(),
  option_text: z.string().trim().min(1, "Write the answer choice.").max(240, "Use 240 characters or fewer."),
  is_correct: z.boolean(),
})

const quizQuestionInput = z
  .object({
    id: z.uuid().optional(),
    question_text: z
      .string()
      .trim()
      .min(5, "Write the question (at least 5 characters).")
      .max(400, "Use 400 characters or fewer."),
    explanation: z.string().trim().max(600, "Use 600 characters or fewer."),
    options: z
      .array(quizOptionInput)
      .min(2, "Add at least two answer choices.")
      .max(6, "Use at most six answer choices."),
  })
  .refine((question) => question.options.filter((option) => option.is_correct).length === 1, {
    path: ["options"],
    message: "Mark exactly one answer choice as correct.",
  })

/**
 * The lesson editor's payload, validated on the server before it is handed to
 * `admin_upsert_lesson`. Field names match the database function's JSON keys.
 * The database repeats the important checks, so this is for friendly messages.
 */
export const lessonInputSchema = z
  .object({
    learning_world_id: z.uuid("Choose a learning world."),
    title: z.string().trim().min(3, "Add a title (at least 3 characters).").max(120, "Use 120 characters or fewer."),
    slug: slug(120),
    description: z.string().trim().max(600, "Use 600 characters or fewer."),
    age_band: z.enum(AGE_BANDS),
    difficulty: z.enum(DIFFICULTIES),
    estimated_minutes: z.number().int().min(1, "Use at least 1 minute.").max(120, "Use 120 minutes or fewer."),
    display_order: z.number().int().min(0).max(10000),
    learning_objectives: lines("objective"),
    video_asset_key: optionalKey,
    captions_asset_key: optionalKey,
    transcript: z.string().trim().max(20000, "Use 20,000 characters or fewer."),
    key_terms: z
      .array(
        z.object({
          term: z.string().trim().max(80, "Use 80 characters or fewer."),
          definition: z.string().trim().max(400, "Use 400 characters or fewer."),
        })
      )
      .max(20, "Use at most 20 key terms.")
      .transform((terms) => terms.filter((item) => item.term.length > 0 || item.definition.length > 0))
      .refine((terms) => terms.every((item) => item.term.length > 0 && item.definition.length > 0), {
        message: "Every key term needs both a term and a definition.",
      }),
    key_takeaways: lines("takeaway"),
    advantages: lines("advantage"),
    limitations: lines("limitation"),
    safety_notes: lines("safety note"),
    is_sample: z.boolean(),
    quiz: z.object({
      title: z.string().trim().max(120, "Use 120 characters or fewer."),
      instructions: z.string().trim().max(600, "Use 600 characters or fewer."),
      passing_score: z.number().int().min(0).max(100),
      questions: z.array(quizQuestionInput).max(20, "Use at most 20 questions."),
    }),
  })
  .refine((lesson) => lesson.captions_asset_key === "" || lesson.video_asset_key !== "", {
    path: ["captions_asset_key"],
    message: "Captions need a video. Add the video path first.",
  })

export type LessonInput = z.infer<typeof lessonInputSchema>

/** `admin_get_lesson`: the full lesson document, including the answer key. */
export const adminLessonSchema = z.object({
  id: z.uuid(),
  learning_world_id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  age_band: z.enum(AGE_BANDS),
  difficulty: z.enum(DIFFICULTIES),
  estimated_minutes: z.number().int(),
  display_order: z.number().int(),
  learning_objectives: z.array(z.string()),
  video_asset_key: z.string().nullable(),
  captions_asset_key: z.string().nullable(),
  transcript: z.string(),
  key_terms: z.array(z.object({ term: z.string(), definition: z.string() })),
  key_takeaways: z.array(z.string()),
  advantages: z.array(z.string()),
  limitations: z.array(z.string()),
  safety_notes: z.array(z.string()),
  is_sample: z.boolean(),
  status: z.enum(LESSON_STATUSES),
  published_at: z.string().nullable(),
  updated_at: z.string(),
  quiz: z
    .object({
      id: z.uuid(),
      title: z.string(),
      instructions: z.string(),
      passing_score: z.number().int(),
      is_published: z.boolean(),
      questions: z.array(
        z.object({
          id: z.uuid(),
          question_text: z.string(),
          explanation: z.string(),
          options: z.array(
            z.object({
              id: z.uuid(),
              option_text: z.string(),
              is_correct: z.boolean(),
            })
          ),
        })
      ),
    })
    .nullable(),
  versions: z.array(
    z.object({
      version_number: z.number().int(),
      created_at: z.string(),
      changed_by_name: z.string().nullable(),
      status: z.string().nullable(),
    })
  ),
})

export type AdminLesson = z.infer<typeof adminLessonSchema>

/** `admin_content_overview`. */
export const contentOverviewSchema = z.object({
  worlds_total: z.number().int(),
  worlds_active: z.number().int(),
  lessons_total: z.number().int(),
  lessons_published: z.number().int(),
  lessons_draft: z.number().int(),
  lessons_archived: z.number().int(),
  lessons_sample: z.number().int(),
  lessons_without_video: z.number().int(),
  quizzes_total: z.number().int(),
  questions_total: z.number().int(),
  families_total: z.number().int(),
  child_profiles_total: z.number().int(),
  lessons_completed_total: z.number().int(),
  quiz_attempts_total: z.number().int(),
})

export type ContentOverview = z.infer<typeof contentOverviewSchema>

export const worldInputSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(2, "Add a title (at least 2 characters).").max(80, "Use 80 characters or fewer."),
  slug: slug(80),
  description: z.string().trim().max(500, "Use 500 characters or fewer."),
  image_key: z.enum(WORLD_IMAGE_KEYS, "Choose an illustration."),
  age_band: z.enum(AGE_BANDS),
  display_order: z.number().int().min(0).max(10000),
  is_active: z.boolean(),
})

export type WorldInput = z.infer<typeof worldInputSchema>

/** Starting values for a brand-new lesson in the editor. */
export function emptyLessonInput(worldId: string): LessonInput {
  return {
    learning_world_id: worldId,
    title: "",
    slug: "",
    description: "",
    age_band: "8-12",
    difficulty: "beginner",
    estimated_minutes: 8,
    display_order: 0,
    learning_objectives: [""],
    video_asset_key: "",
    captions_asset_key: "",
    transcript: "",
    key_terms: [{ term: "", definition: "" }],
    key_takeaways: [""],
    advantages: [""],
    limitations: [""],
    safety_notes: [""],
    is_sample: false,
    quiz: { title: "", instructions: "", passing_score: 60, questions: [] },
  }
}

/** Converts a stored lesson into editor values. */
export function toLessonInput(lesson: AdminLesson): LessonInput {
  return {
    learning_world_id: lesson.learning_world_id,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    age_band: lesson.age_band,
    difficulty: lesson.difficulty,
    estimated_minutes: lesson.estimated_minutes,
    display_order: lesson.display_order,
    learning_objectives: lesson.learning_objectives,
    video_asset_key: lesson.video_asset_key ?? "",
    captions_asset_key: lesson.captions_asset_key ?? "",
    transcript: lesson.transcript,
    key_terms: lesson.key_terms,
    key_takeaways: lesson.key_takeaways,
    advantages: lesson.advantages,
    limitations: lesson.limitations,
    safety_notes: lesson.safety_notes,
    is_sample: lesson.is_sample,
    quiz: {
      title: lesson.quiz?.title ?? "",
      instructions: lesson.quiz?.instructions ?? "",
      passing_score: lesson.quiz?.passing_score ?? 60,
      questions:
        lesson.quiz?.questions.map((question) => ({
          id: question.id,
          question_text: question.question_text,
          explanation: question.explanation,
          options: question.options.map((option) => ({
            id: option.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
          })),
        })) ?? [],
    },
  }
}
