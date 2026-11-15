/**
 * App ↔ database contract.
 *
 * The web app cannot be run against a real Supabase project in this
 * environment, so this suite checks the two places where the app and the
 * database must agree, using the app's own code:
 *
 *   1. every column list the app selects exists and is readable by the
 *      `authenticated` role;
 *   2. every database function returns JSON that the app's zod schemas accept.
 *
 * It also checks that the generated TypeScript types are up to date.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { adminLessonSchema, contentOverviewSchema, lessonInputSchema, toLessonInput } from "@/features/admin-content/schemas"
import {
  childSummarySchema,
  dailyChallengeSchema,
  dailyChallengeSubmissionSchema,
  leaderboardSchema,
} from "@/features/gamification/schemas"
import { keyTermsSchema, lessonCompletionSchema } from "@/features/lessons/schemas"
import { answerFeedbackSchema, quizResultSchema, quizStartSchema } from "@/features/quizzes/schemas"
import { COLUMN_TABLES, COLUMNS } from "@/lib/db-columns"
import { buildDatabaseTypes } from "../../scripts/lib/build-db-types"
import { TestDatabase } from "./helpers/db"
import { createFamilies, getQuizKey, LESSON_A, LESSON_B, type Families } from "./helpers/fixtures"

const TYPES_FILE = fileURLToPath(new URL("../../src/types/database.ts", import.meta.url))

describe("app ↔ database contract", () => {
  let db: TestDatabase
  let f: Families

  beforeAll(async () => {
    db = await TestDatabase.create()
    f = await createFamilies(db)
  })

  afterAll(async () => {
    await db.close()
  })

  it("src/types/database.ts matches the migrations (run `npm run types:generate` if this fails)", async () => {
    const fresh = await TestDatabase.create({ seed: false })
    try {
      expect(readFileSync(TYPES_FILE, "utf8")).toBe(await buildDatabaseTypes(fresh))
    } finally {
      await fresh.close()
    }
  })

  describe("column lists", () => {
    it.each(Object.keys(COLUMNS) as (keyof typeof COLUMNS)[])(
      "%s can be selected by a signed-in user",
      async (key) => {
        const rows = await db.asUser(f.parentA, (q) =>
          q(`select ${COLUMNS[key]} from public.${COLUMN_TABLES[key]} limit 1`)
        )
        expect(Array.isArray(rows)).toBe(true)
      }
    )

    it("never ask for the answer key or explanations", () => {
      // quiz_responses.is_correct (the verdict on a child's own stored answer)
      // is legitimately readable; the key itself lives on these two tables.
      expect(COLUMNS.quiz_options).not.toMatch(/is_correct/)
      expect(COLUMNS.quiz_questions).not.toMatch(/explanation/)
      expect(Object.values(COLUMN_TABLES)).not.toContain("content_versions")
    })
  })

  describe("function results parse with the app's schemas", () => {
    it("lesson and quiz flow", async () => {
      const quiz = await getQuizKey(db, LESSON_A)

      const completion = await db.rpc(f.parentA, "complete_lesson", [f.childA, quiz.lessonId])
      expect(() => lessonCompletionSchema.parse(completion)).not.toThrow()

      const start = quizStartSchema.parse(
        await db.rpc(f.parentA, "start_quiz_attempt", [f.childA, quiz.quizId])
      )
      for (const question of quiz.questions) {
        const feedback = await db.rpc(f.parentA, "answer_quiz_question", [
          start.attempt_id,
          question.id,
          question.correctOptionId,
        ])
        expect(() => answerFeedbackSchema.parse(feedback)).not.toThrow()
      }

      // Resuming returns the saved answers in the same shape.
      const resumed = quizStartSchema.parse(
        await db.rpc(f.parentA, "start_quiz_attempt", [f.childA, quiz.quizId])
      )
      expect(resumed.answered).toHaveLength(5)

      const result = quizResultSchema.parse(
        await db.rpc(f.parentA, "complete_quiz_attempt", [start.attempt_id])
      )
      expect(result.score).toBe(100)
      const repeat = quizResultSchema.parse(
        await db.rpc(f.parentA, "complete_quiz_attempt", [start.attempt_id])
      )
      expect(repeat.already_completed).toBe(true)
    })

    it("summary and leaderboard, with and without activity", async () => {
      const active = childSummarySchema.parse(await db.rpc(f.parentA, "get_child_summary", [f.childA]))
      expect(active.total_xp).toBeGreaterThan(0)

      const empty = childSummarySchema.parse(await db.rpc(f.parentB, "get_child_summary", [f.childB]))
      expect(empty.accuracy_percent).toBeNull()
      expect(empty.last_learning_date).toBeNull()

      const board = leaderboardSchema.parse(
        await db.rpc(f.parentA, "get_weekly_leaderboard", [f.childA, 10])
      )
      expect(board.self.rank).toBe(1)
      const emptyBoard = leaderboardSchema.parse(
        await db.rpc(f.parentB, "get_weekly_leaderboard", [f.childB, 10])
      )
      expect(emptyBoard.self.rank).toBeNull()
    })

    it("daily challenge, before and after answering", async () => {
      const before = dailyChallengeSchema.parse(await db.rpc(f.parentA, "get_daily_challenge", [f.childA]))
      expect(before.question?.options.length).toBeGreaterThanOrEqual(2)

      const submitted = dailyChallengeSubmissionSchema.parse(
        await db.rpc(f.parentA, "submit_daily_challenge", [f.childA, before.question?.options[0]?.id])
      )
      expect(submitted.points_awarded).toBe(15)

      const after = dailyChallengeSchema.parse(await db.rpc(f.parentA, "get_daily_challenge", [f.childA]))
      expect(after.completed).toBe(true)
      expect(after.result).not.toBeNull()
    })

    it("admin lesson document and overview", async () => {
      const quiz = await getQuizKey(db, LESSON_B)
      const lesson = adminLessonSchema.parse(await db.rpc(f.admin, "admin_get_lesson", [quiz.lessonId]))
      expect(lesson.quiz?.questions).toHaveLength(5)
      expect(() => contentOverviewSchema.parse({})).toThrow()
      const overview = contentOverviewSchema.parse(await db.rpc(f.admin, "admin_content_overview"))
      expect(overview.lessons_published).toBe(12)
    })

    it("stored key terms parse for every seeded lesson", async () => {
      const rows = await db.asUser(f.parentA, (q) => q<{ key_terms: unknown }>("select key_terms from public.lessons"))
      for (const row of rows) expect(() => keyTermsSchema.parse(row.key_terms)).not.toThrow()
    })
  })

  describe("the lesson editor round-trip", () => {
    it("a stored lesson loads into the editor, validates, and saves back unchanged", async () => {
      const quiz = await getQuizKey(db, LESSON_B)
      const stored = adminLessonSchema.parse(await db.rpc(f.admin, "admin_get_lesson", [quiz.lessonId]))

      // Exactly what the app does: document -> form values -> validated payload -> save.
      const payload = lessonInputSchema.parse(toLessonInput(stored))
      const savedId = await db.rpc<string>(f.admin, "admin_upsert_lesson", [payload, stored.id])
      expect(savedId).toBe(stored.id)

      const reloaded = adminLessonSchema.parse(await db.rpc(f.admin, "admin_get_lesson", [quiz.lessonId]))
      // Everything except the version list and the modification time is unchanged.
      const comparable = (lesson: typeof stored) => ({ ...lesson, versions: [], updated_at: "" })
      expect(comparable(reloaded)).toEqual(comparable(stored))
      expect(reloaded.versions.length).toBe(stored.versions.length + 1)
    })

    it("a new lesson built from validated editor values can be created and published", async () => {
      const worlds = await db.asUser(f.admin, (q) => q<{ id: string }>("select id from public.learning_worlds limit 1"))
      const payload = lessonInputSchema.parse({
        learning_world_id: worlds[0]!.id,
        title: "How Do Smart Speakers Listen?",
        slug: "how-do-smart-speakers-listen",
        description: "Learn how a smart speaker waits for its wake word.",
        age_band: "8-12",
        difficulty: "beginner",
        estimated_minutes: 6,
        display_order: 9,
        learning_objectives: ["Explain what a wake word is.", ""],
        video_asset_key: "",
        captions_asset_key: "",
        transcript: "A smart speaker listens for one special word. Only after it hears that word does it record your request.",
        key_terms: [{ term: "Wake word", definition: "The word that starts the speaker listening." }, { term: "", definition: "" }],
        key_takeaways: ["Speakers wait for a wake word."],
        advantages: ["Hands-free."],
        limitations: ["Can mishear."],
        safety_notes: ["Ask an adult about privacy settings."],
        is_sample: false,
        quiz: {
          title: "",
          instructions: "",
          passing_score: 60,
          questions: [
            {
              question_text: "What starts a smart speaker listening?",
              explanation: "Its wake word.",
              options: [
                { option_text: "A wake word", is_correct: true },
                { option_text: "A torch", is_correct: false },
              ],
            },
          ],
        },
      })
      const id = await db.rpc<string>(f.admin, "admin_upsert_lesson", [payload, null])
      await db.rpc(f.admin, "admin_set_lesson_status", [id, "published"])

      const visible = await db.asUser(f.parentA, (q) => q("select id from public.lessons where id = $1", [id]))
      expect(visible).toHaveLength(1)
    })
  })
})
