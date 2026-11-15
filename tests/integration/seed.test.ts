import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { EXPLORER_ADJECTIVES, EXPLORER_NOUNS } from "@/config/explorer-names"
import { WORLD_CATALOG } from "@/config/worlds"
import { buildSeedSql } from "../../supabase/seed/build-seed"
import { SEED_LESSONS } from "../../supabase/seed/content"
import { TestDatabase } from "./helpers/db"

const SEED_FILE = fileURLToPath(new URL("../../supabase/seed.sql", import.meta.url))

describe("seed data", () => {
  let db: TestDatabase

  beforeAll(async () => {
    db = await TestDatabase.create()
  })

  afterAll(async () => {
    await db.close()
  })

  it("seed.sql on disk matches the typed content (run `npm run seed:generate` if this fails)", () => {
    expect(readFileSync(SEED_FILE, "utf8")).toBe(buildSeedSql())
  })

  it("creates the six learning worlds in order", async () => {
    const rows = await db.admin<{ slug: string; title: string }>(
      "select slug, title from public.learning_worlds where is_active order by display_order"
    )
    expect(rows).toEqual(WORLD_CATALOG.map((world) => ({ slug: world.slug, title: world.title })))
    expect(rows).toHaveLength(6)
  })

  it("creates twelve published sample lessons, two per world, none with a video", async () => {
    const rows = await db.admin<{
      world: string
      lessons: number
      published: number
      sample: number
      with_video: number
    }>(
      `select w.slug as world,
              count(*)::int as lessons,
              count(*) filter (where l.status = 'published' and l.published_at is not null)::int as published,
              count(*) filter (where l.is_sample)::int as sample,
              count(*) filter (where l.video_asset_key is not null)::int as with_video
       from public.lessons l join public.learning_worlds w on w.id = l.learning_world_id
       group by w.slug`
    )
    expect(rows).toHaveLength(6)
    for (const row of rows) {
      expect(row).toMatchObject({ lessons: 2, published: 2, sample: 2, with_video: 0 })
    }
  })

  it("stores every lesson's educational content", async () => {
    const rows = await db.admin<{ slug: string }>(
      `select slug from public.lessons
       where char_length(description) < 40
          or char_length(transcript) < 400
          or coalesce(array_length(learning_objectives, 1), 0) < 3
          or coalesce(array_length(key_takeaways, 1), 0) < 3
          or coalesce(array_length(advantages, 1), 0) < 3
          or coalesce(array_length(limitations, 1), 0) < 3
          or coalesce(array_length(safety_notes, 1), 0) < 2
          or jsonb_array_length(key_terms) < 3`
    )
    expect(rows).toEqual([])
  })

  it("gives every lesson a published five-question quiz with exactly one correct option per question", async () => {
    const quizzes = await db.admin<{ questions: number }>(
      `select count(qq.id)::int as questions
       from public.quizzes q
       left join public.quiz_questions qq on qq.quiz_id = q.id
       where q.is_published
       group by q.id`
    )
    expect(quizzes).toHaveLength(SEED_LESSONS.length)
    expect(quizzes.every((quiz) => quiz.questions === 5)).toBe(true)

    const badQuestions = await db.admin(
      `select qq.id
       from public.quiz_questions qq
       where (select count(*) from public.quiz_options o where o.question_id = qq.id) <> 4
          or (select count(*) from public.quiz_options o where o.question_id = qq.id and o.is_correct) <> 1
          or char_length(qq.explanation) = 0`
    )
    expect(badQuestions).toEqual([])
  })

  it("records a first content version for every lesson, including the answer key", async () => {
    const rows = await db.admin<{ versions: number; questions: number }>(
      `select count(*)::int as versions,
              max(jsonb_array_length(v.content_snapshot -> 'quiz' -> 'questions'))::int as questions
       from public.content_versions v
       group by v.lesson_id`
    )
    expect(rows).toHaveLength(12)
    expect(rows.every((row) => row.versions === 1 && row.questions === 5)).toBe(true)
  })

  it("creates no accounts, children or learner records", async () => {
    const rows = await db.admin<{ n: number }>(
      `select (select count(*) from auth.users)::int
            + (select count(*) from public.profiles)::int
            + (select count(*) from public.child_profiles)::int
            + (select count(*) from public.points_ledger)::int
            + (select count(*) from public.quiz_attempts)::int as n`
    )
    expect(rows[0]?.n).toBe(0)
  })

  it("can be applied again without duplicating or overwriting anything", async () => {
    await db.admin("update public.lessons set title = 'Edited by an admin' where slug = $1", [
      SEED_LESSONS[0]?.slug,
    ])
    await db.execScript(readFileSync(SEED_FILE, "utf8"))

    const counts = await db.admin<{ lessons: number; questions: number; options: number; versions: number }>(
      `select (select count(*) from public.lessons)::int as lessons,
              (select count(*) from public.quiz_questions)::int as questions,
              (select count(*) from public.quiz_options)::int as options,
              (select count(*) from public.content_versions)::int as versions`
    )
    expect(counts[0]).toEqual({ lessons: 12, questions: 60, options: 240, versions: 12 })

    const edited = await db.admin<{ title: string }>(
      "select title from public.lessons where slug = $1",
      [SEED_LESSONS[0]?.slug]
    )
    expect(edited[0]?.title).toBe("Edited by an admin")
  })

  it("keeps the explorer-name word lists identical in the app and the database", async () => {
    const rows = await db.admin<{ adjectives: string[]; nouns: string[] }>(
      "select app_private.explorer_adjectives() as adjectives, app_private.explorer_nouns() as nouns"
    )
    expect(rows[0]?.adjectives).toEqual([...EXPLORER_ADJECTIVES])
    expect(rows[0]?.nouns).toEqual([...EXPLORER_NOUNS])
  })
})
