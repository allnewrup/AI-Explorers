import "server-only"

import type { AgeBand } from "@/config/age-bands"
import { COLUMNS } from "@/lib/db-columns"
import { createClient } from "@/lib/supabase/server"
import type { Enums } from "@/types/database"
import { keyTermsSchema, type KeyTerm } from "./schemas"

export type LessonDetail = {
  id: string
  title: string
  slug: string
  description: string
  ageBand: AgeBand
  difficulty: Enums<"difficulty_level">
  estimatedMinutes: number
  learningObjectives: string[]
  videoAssetKey: string | null
  captionsAssetKey: string | null
  transcript: string
  keyTerms: KeyTerm[]
  keyTakeaways: string[]
  advantages: string[]
  limitations: string[]
  safetyNotes: string[]
  isSample: boolean
  world: { id: string; title: string; slug: string; imageKey: string }
}

export type LessonProgress = {
  started: boolean
  completed: boolean
  completedAt: string | null
}

export type QuizForPlay = {
  id: string
  title: string
  instructions: string
  passingScore: number
  questions: {
    id: string
    text: string
    options: { id: string; text: string }[]
  }[]
}

export type LessonMedia =
  | { state: "pending" }
  | { state: "unavailable" }
  | { state: "ready"; videoUrl: string; captionsUrl: string | null }

/**
 * A lesson as children may see it: published, in an active world.
 *
 * Drafts are excluded twice over — by row-level security for parents, and by
 * the explicit status filter here so that an administrator browsing the child
 * area cannot stumble on a draft through its URL either. Draft previews live
 * under /admin only.
 */
export async function getPublishedLessonBySlug(slug: string): Promise<LessonDetail | null> {
  const supabase = await createClient()
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(COLUMNS.lessons_detail)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()

  if (error) throw new Error(`Could not load the lesson (${error.code ?? "unknown"}).`)
  if (!lesson) return null

  const { data: world, error: worldError } = await supabase
    .from("learning_worlds")
    .select(COLUMNS.learning_worlds)
    .eq("id", lesson.learning_world_id)
    .eq("is_active", true)
    .maybeSingle()

  if (worldError) throw new Error(`Could not load the lesson's world (${worldError.code ?? "unknown"}).`)
  if (!world) return null

  const keyTerms = keyTermsSchema.safeParse(lesson.key_terms)

  return {
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    description: lesson.description,
    ageBand: lesson.age_band,
    difficulty: lesson.difficulty,
    estimatedMinutes: lesson.estimated_minutes,
    learningObjectives: lesson.learning_objectives,
    videoAssetKey: lesson.video_asset_key,
    captionsAssetKey: lesson.captions_asset_key,
    transcript: lesson.transcript,
    keyTerms: keyTerms.success ? keyTerms.data : [],
    keyTakeaways: lesson.key_takeaways,
    advantages: lesson.advantages,
    limitations: lesson.limitations,
    safetyNotes: lesson.safety_notes,
    isSample: lesson.is_sample,
    world: { id: world.id, title: world.title, slug: world.slug, imageKey: world.image_key },
  }
}

export async function getLessonProgress(childId: string, lessonId: string): Promise<LessonProgress> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lesson_progress")
    .select(COLUMNS.lesson_progress)
    .eq("child_profile_id", childId)
    .eq("lesson_id", lessonId)
    .maybeSingle()

  if (error) throw new Error(`Could not load lesson progress (${error.code ?? "unknown"}).`)
  return {
    started: data !== null,
    completed: data?.lesson_completed ?? false,
    completedAt: data?.completed_at ?? null,
  }
}

/**
 * The quiz as it is sent to the browser: questions and answer choices only.
 * The answer key cannot be part of this query — the API role has no SELECT
 * privilege on `is_correct` or `explanation`.
 */
export async function getQuizForLesson(lessonId: string): Promise<QuizForPlay | null> {
  const supabase = await createClient()
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select(COLUMNS.quizzes)
    .eq("lesson_id", lessonId)
    .maybeSingle()

  if (error) throw new Error(`Could not load the quiz (${error.code ?? "unknown"}).`)
  if (!quiz) return null

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select(COLUMNS.quiz_questions)
    .eq("quiz_id", quiz.id)
    .order("display_order", { ascending: true })

  if (questionsError) throw new Error(`Could not load quiz questions (${questionsError.code ?? "unknown"}).`)
  if (questions.length === 0) return null

  const { data: options, error: optionsError } = await supabase
    .from("quiz_options")
    .select(COLUMNS.quiz_options)
    .in(
      "question_id",
      questions.map((question) => question.id)
    )
    .order("display_order", { ascending: true })

  if (optionsError) throw new Error(`Could not load answer choices (${optionsError.code ?? "unknown"}).`)

  return {
    id: quiz.id,
    title: quiz.title,
    instructions: quiz.instructions,
    passingScore: quiz.passing_score,
    questions: questions.map((question) => ({
      id: question.id,
      text: question.question_text,
      options: options
        .filter((option) => option.question_id === question.id)
        .map((option) => ({ id: option.id, text: option.option_text })),
    })),
  }
}

const SIGNED_URL_SECONDS = 60 * 60

/**
 * Resolves a lesson's video to a short-lived signed URL.
 *
 *   pending      no video has been uploaded for this lesson
 *   unavailable  an asset key is set but storage would not sign it
 *   ready        playable
 *
 * The app never invents a video: without a real stored asset there is no
 * player, only a clearly labelled "coming soon" panel.
 */
export async function getLessonMedia(lesson: {
  videoAssetKey: string | null
  captionsAssetKey: string | null
}): Promise<LessonMedia> {
  if (!lesson.videoAssetKey) return { state: "pending" }

  const supabase = await createClient()
  const bucket = supabase.storage.from("lesson-media")

  const { data: video, error } = await bucket.createSignedUrl(lesson.videoAssetKey, SIGNED_URL_SECONDS)
  if (error || !video?.signedUrl) return { state: "unavailable" }

  let captionsUrl: string | null = null
  if (lesson.captionsAssetKey) {
    const { data: captions } = await bucket.createSignedUrl(lesson.captionsAssetKey, SIGNED_URL_SECONDS)
    captionsUrl = captions?.signedUrl ?? null
  }

  return { state: "ready", videoUrl: video.signedUrl, captionsUrl }
}
