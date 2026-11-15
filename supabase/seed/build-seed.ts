import { createHash } from "node:crypto"
import { WORLD_CATALOG } from "../../src/config/worlds"
import { SEED_ACHIEVEMENTS, SEED_LESSONS } from "./content"
import type { SeedLesson } from "./types"

const NAMESPACE = "ai-explorers.seed.v1"

/**
 * A stable UUID derived from a readable key, so re-running the seed never
 * creates duplicates and ids are the same in every environment.
 */
export function seedId(key: string): string {
  const bytes = Buffer.from(createHash("sha1").update(`${NAMESPACE}:${key}`).digest().subarray(0, 16))
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x50
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = bytes.toString("hex")
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join("-")
}

export const seedIds = {
  world: (slug: string) => seedId(`world:${slug}`),
  lesson: (slug: string) => seedId(`lesson:${slug}`),
  quiz: (lessonSlug: string) => seedId(`quiz:${lessonSlug}`),
  question: (lessonSlug: string, index: number) => seedId(`question:${lessonSlug}:${index}`),
  option: (lessonSlug: string, questionIndex: number, optionIndex: number) =>
    seedId(`option:${lessonSlug}:${questionIndex}:${optionIndex}`),
  achievement: (badgeKey: string) => seedId(`achievement:${badgeKey}`),
}

const text = (value: string) => `'${value.replace(/'/g, "''")}'`
const textArray = (values: string[]) =>
  values.length > 0 ? `array[${values.map(text).join(", ")}]::text[]` : `'{}'::text[]`
const json = (value: unknown) => `${text(JSON.stringify(value))}::jsonb`

export const QUESTIONS_PER_QUIZ = 5
export const OPTIONS_PER_QUESTION = 4

/** Throws a readable error if the authored content breaks a rule. */
export function validateSeedContent(lessons: SeedLesson[] = SEED_LESSONS): void {
  const worldSlugs = new Set(WORLD_CATALOG.map((world) => world.slug))
  const seenSlugs = new Set<string>()

  for (const lesson of lessons) {
    const where = `lesson "${lesson.slug}"`
    if (!worldSlugs.has(lesson.worldSlug)) throw new Error(`${where}: unknown world "${lesson.worldSlug}"`)
    if (seenSlugs.has(lesson.slug)) throw new Error(`${where}: duplicate slug`)
    seenSlugs.add(lesson.slug)

    const required: [string, unknown[]][] = [
      ["learningObjectives", lesson.learningObjectives],
      ["keyTerms", lesson.keyTerms],
      ["keyTakeaways", lesson.keyTakeaways],
      ["advantages", lesson.advantages],
      ["limitations", lesson.limitations],
      ["safetyNotes", lesson.safetyNotes],
    ]
    for (const [name, list] of required) {
      if (list.length === 0) throw new Error(`${where}: ${name} must not be empty`)
    }
    if (lesson.transcript.trim().length < 400) throw new Error(`${where}: transcript is too short`)

    if (lesson.quiz.questions.length !== QUESTIONS_PER_QUIZ) {
      throw new Error(`${where}: expected ${QUESTIONS_PER_QUIZ} questions`)
    }
    lesson.quiz.questions.forEach((question, index) => {
      const label = `${where} question ${index + 1}`
      if (question.options.length !== OPTIONS_PER_QUESTION) {
        throw new Error(`${label}: expected ${OPTIONS_PER_QUESTION} options`)
      }
      if (question.options.filter((option) => option.correct).length !== 1) {
        throw new Error(`${label}: exactly one option must be correct`)
      }
      if (new Set(question.options.map((option) => option.text)).size !== question.options.length) {
        throw new Error(`${label}: options must be different from each other`)
      }
      if (question.explanation.trim().length === 0) throw new Error(`${label}: explanation is required`)
    })
  }
}

/** Builds the complete, idempotent supabase/seed.sql. */
export function buildSeedSql(): string {
  validateSeedContent()

  const out: string[] = []
  const push = (...lines: string[]) => out.push(...lines)

  push(
    "-- =============================================================================",
    "-- AI Explorers — seed data",
    "-- -----------------------------------------------------------------------------",
    "-- GENERATED FILE. Do not edit by hand.",
    "--   Source:      supabase/seed/content/*.ts and src/config/worlds.ts",
    "--   Regenerate:  npm run seed:generate",
    "--",
    "-- Contains six learning worlds, twelve original SAMPLE lessons (each with a",
    "-- five-question quiz) and six achievements. No accounts, no children and no",
    "-- personal data are created.",
    "--",
    "-- Lessons are seeded as published sample content (is_sample = true) and have",
    "-- no video (video_asset_key is NULL): the app shows a \"video coming soon\"",
    "-- state rather than a placeholder player.",
    "--",
    "-- Safe to run more than once: rows that already exist are left untouched, so",
    "-- edits made later in the admin CMS are never overwritten.",
    "-- =============================================================================",
    ""
  )

  push("-- Learning worlds")
  for (const world of WORLD_CATALOG) {
    push(
      "insert into public.learning_worlds (id, title, slug, description, image_key, age_band, display_order, is_active)",
      `values (${text(seedIds.world(world.slug))}, ${text(world.title)}, ${text(world.slug)}, ${text(world.description)}, ${text(world.imageKey)}, ${text(world.ageBand)}, ${world.displayOrder}, true)`,
      "on conflict (id) do nothing;"
    )
  }
  push("")

  const orderInWorld = new Map<string, number>()
  for (const lesson of SEED_LESSONS) {
    const order = (orderInWorld.get(lesson.worldSlug) ?? 0) + 1
    orderInWorld.set(lesson.worldSlug, order)
    const lessonId = seedIds.lesson(lesson.slug)
    const quizId = seedIds.quiz(lesson.slug)

    push(
      `-- Lesson: ${lesson.title}`,
      "insert into public.lessons (",
      "  id, learning_world_id, title, slug, description, age_band, difficulty, estimated_minutes,",
      "  display_order, learning_objectives, transcript, key_terms, key_takeaways, advantages,",
      "  limitations, safety_notes, is_sample, status, published_at",
      ")",
      "values (",
      `  ${text(lessonId)},`,
      `  ${text(seedIds.world(lesson.worldSlug))},`,
      `  ${text(lesson.title)},`,
      `  ${text(lesson.slug)},`,
      `  ${text(lesson.description)},`,
      `  '8-12',`,
      `  ${text(lesson.difficulty)},`,
      `  ${lesson.estimatedMinutes},`,
      `  ${order},`,
      `  ${textArray(lesson.learningObjectives)},`,
      `  ${text(lesson.transcript)},`,
      `  ${json(lesson.keyTerms)},`,
      `  ${textArray(lesson.keyTakeaways)},`,
      `  ${textArray(lesson.advantages)},`,
      `  ${textArray(lesson.limitations)},`,
      `  ${textArray(lesson.safetyNotes)},`,
      "  true,",
      "  'published',",
      "  now()",
      ")",
      "on conflict (id) do nothing;",
      "",
      "insert into public.quizzes (id, lesson_id, title, instructions, passing_score, is_published)",
      `values (${text(quizId)}, ${text(lessonId)}, ${text(`Quiz: ${lesson.title}`)}, ${text(lesson.quiz.instructions)}, ${lesson.quiz.passingScore}, true)`,
      "on conflict (id) do nothing;",
      ""
    )

    lesson.quiz.questions.forEach((question, questionIndex) => {
      const questionId = seedIds.question(lesson.slug, questionIndex + 1)
      push(
        "insert into public.quiz_questions (id, quiz_id, question_text, difficulty, explanation, display_order)",
        `values (${text(questionId)}, ${text(quizId)}, ${text(question.question)}, ${text(lesson.difficulty)}, ${text(question.explanation)}, ${questionIndex + 1})`,
        "on conflict (id) do nothing;",
        "insert into public.quiz_options (id, question_id, option_text, is_correct, display_order)",
        "values"
      )
      const rows = question.options.map((option, optionIndex) => {
        const optionId = seedIds.option(lesson.slug, questionIndex + 1, optionIndex + 1)
        return `  (${text(optionId)}, ${text(questionId)}, ${text(option.text)}, ${option.correct ? "true" : "false"}, ${optionIndex + 1})`
      })
      push(rows.join(",\n"), "on conflict (id) do nothing;", "")
    })
  }

  push("-- Achievements")
  for (const achievement of SEED_ACHIEVEMENTS) {
    push(
      "insert into public.achievements (id, title, description, badge_key, points_threshold, is_active)",
      `values (${text(seedIds.achievement(achievement.badgeKey))}, ${text(achievement.title)}, ${text(achievement.description)}, ${text(achievement.badgeKey)}, ${achievement.pointsThreshold}, true)`,
      "on conflict (id) do nothing;"
    )
  }
  push("")

  push(
    "-- First content version for every sample lesson that does not have one yet.",
    "do $$",
    "declare",
    "  v_lesson_id uuid;",
    "begin",
    "  for v_lesson_id in",
    "    select l.id",
    "    from public.lessons l",
    "    where l.is_sample",
    "      and not exists (select 1 from public.content_versions v where v.lesson_id = l.id)",
    "  loop",
    "    perform app_private.snapshot_lesson(v_lesson_id, null);",
    "  end loop;",
    "end;",
    "$$;",
    ""
  )

  return out.join("\n")
}
