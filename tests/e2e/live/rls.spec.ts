import { expect, test } from "@playwright/test"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  anonymousClient,
  createChildFor,
  createTestParent,
  deleteTestUser,
  signedInClient,
  type TestUser,
} from "./helpers"

/**
 * Row-level security against a REAL Supabase project, through the same HTTP
 * API a browser uses. Mirrors tests/integration/access-control.test.ts.
 *
 * NOT YET EXECUTED: see README.md in this folder.
 */

const DENIED = ["42501", "PGRST301", "PGRST302"]

test.describe.configure({ mode: "serial" })

test.describe("live row-level security", () => {
  let parentA: TestUser
  let parentB: TestUser
  let a: SupabaseClient
  let b: SupabaseClient
  let childA: string
  let lessonId: string

  test.beforeAll(async () => {
    parentA = await createTestParent("rls-a")
    parentB = await createTestParent("rls-b")
    a = await signedInClient(parentA.email, parentA.password)
    b = await signedInClient(parentB.email, parentB.password)
    childA = await createChildFor(a, "CosmicOtter42")
    await createChildFor(b, "BravePanda17")

    const { data: lessons, error } = await a.from("lessons").select("id").order("display_order").limit(1)
    if (error || !lessons?.[0]) throw new Error("No published lessons found. Has the seed been applied?")
    lessonId = lessons[0].id as string
    const completed = await a.rpc("complete_lesson", { p_child_id: childA, p_lesson_id: lessonId })
    expect(completed.error).toBeNull()
  })

  test.afterAll(async () => {
    await deleteTestUser(parentA)
    await deleteTestUser(parentB)
  })

  test("a parent sees only their own profile and children", async () => {
    const profiles = await a.from("profiles").select("id")
    expect(profiles.data).toEqual([{ id: parentA.id }])

    const children = await b.from("child_profiles").select("id").eq("id", childA)
    expect(children.error).toBeNull()
    expect(children.data).toEqual([])
  })

  test("another parent cannot read or act on a child's records", async () => {
    for (const table of ["lesson_progress", "quiz_attempts", "points_ledger", "learning_streaks", "child_achievements"]) {
      const result = await b.from(table).select("*").eq("child_profile_id", childA)
      expect(result.data ?? [], table).toEqual([])
    }
    for (const [fn, args] of [
      ["get_child_summary", { p_child_id: childA }],
      ["complete_lesson", { p_child_id: childA, p_lesson_id: lessonId }],
      ["get_daily_challenge", { p_child_id: childA }],
    ] as const) {
      const result = await b.rpc(fn, args)
      expect(result.data, fn).toBeNull()
      expect(DENIED, fn).toContain(result.error?.code)
    }
  })

  test("XP cannot be written from a browser session", async () => {
    const before = await a.rpc("get_child_summary", { p_child_id: childA })
    const xp = (before.data as { total_xp: number }).total_xp
    expect(xp).toBe(10)

    const insert = await a.from("points_ledger").insert({
      child_profile_id: childA,
      event_type: "lesson_completed",
      reference_id: crypto.randomUUID(),
      points: 1000,
    })
    expect(DENIED).toContain(insert.error?.code)

    const update = await a.from("points_ledger").update({ points: 1000 }).eq("child_profile_id", childA)
    expect(DENIED).toContain(update.error?.code)

    // Completing the same lesson again awards nothing.
    const again = await a.rpc("complete_lesson", { p_child_id: childA, p_lesson_id: lessonId })
    expect((again.data as { points_awarded: number }).points_awarded).toBe(0)

    const after = await a.rpc("get_child_summary", { p_child_id: childA })
    expect((after.data as { total_xp: number }).total_xp).toBe(xp)
  })

  test("the answer key and explanations cannot be selected", async () => {
    for (const [table, columns] of [
      ["quiz_options", "is_correct"],
      ["quiz_options", "*"],
      ["quiz_questions", "explanation"],
      ["content_versions", "content_snapshot"],
    ] as const) {
      const result = await a.from(table).select(columns).limit(1)
      expect(result.data, `${table}.${columns}`).toBeNull()
      expect(DENIED, `${table}.${columns}`).toContain(result.error?.code)
    }
    const allowed = await a.from("quiz_options").select("id, option_text").limit(1)
    expect(allowed.error).toBeNull()
  })

  test("a parent cannot become an administrator or use admin functions", async () => {
    const promote = await a.from("profiles").update({ role: "admin" }).eq("id", parentA.id)
    expect(DENIED).toContain(promote.error?.code)

    const overview = await a.rpc("admin_content_overview")
    expect(overview.data).toBeNull()
    expect(DENIED).toContain(overview.error?.code)

    const drafts = await a.from("lessons").select("id").neq("status", "published")
    expect(drafts.data).toEqual([])

    const write = await a.from("lessons").update({ title: "Hacked" }).eq("id", lessonId)
    expect(DENIED).toContain(write.error?.code)
  })

  test("signed-out visitors can read world names and nothing else", async () => {
    const anon = anonymousClient()
    const worlds = await anon.from("learning_worlds").select("slug")
    expect(worlds.error).toBeNull()
    expect(worlds.data?.length).toBeGreaterThanOrEqual(6)

    for (const table of ["lessons", "quizzes", "child_profiles", "points_ledger", "profiles"]) {
      const result = await anon.from(table).select("*").limit(1)
      expect(result.data ?? [], table).toEqual([])
    }
    const rpc = await anon.rpc("get_child_summary", { p_child_id: childA })
    expect(rpc.data).toBeNull()
  })
})
