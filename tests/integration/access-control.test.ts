/**
 * Access-control tests.
 *
 * Each block is named after one of the access rules in the product brief and
 * tries to break it the way a hostile or curious signed-in user could: by
 * sending their own SQL-equivalent API requests with a valid session.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { seedIds } from "../../supabase/seed/build-seed"
import { captureError, PERMISSION_DENIED, TestDatabase } from "./helpers/db"
import {
  createFamilies,
  getQuizKey,
  LESSON_A,
  LESSON_B,
  playQuiz,
  totalXp,
  type Families,
  type QuizKey,
} from "./helpers/fixtures"

const LEARNER_TABLES = [
  "lesson_progress",
  "quiz_attempts",
  "points_ledger",
  "child_achievements",
  "learning_streaks",
  "daily_challenge_completions",
] as const

describe("access control", () => {
  let db: TestDatabase
  let f: Families
  let quizA: QuizKey
  let attemptOfChildA: string

  beforeAll(async () => {
    db = await TestDatabase.create()
    f = await createFamilies(db)
    quizA = await getQuizKey(db, LESSON_A)

    // Give child A a realistic history so there is something worth stealing.
    await db.rpc(f.parentA, "complete_lesson", [f.childA, quizA.lessonId])
    const result = await playQuiz(db, f.parentA, f.childA, quizA, 4)
    attemptOfChildA = result.attempt_id
    await db.rpc(f.parentA, "get_daily_challenge", [f.childA])
    const challenge = await db.rpc<{ question: { options: { id: string }[] } }>(
      f.parentA,
      "get_daily_challenge",
      [f.childA]
    )
    await db.rpc(f.parentA, "submit_daily_challenge", [
      f.childA,
      challenge.question.options[0]?.id,
    ])
  })

  afterAll(async () => {
    await db.close()
  })

  describe("rule 1 — parents can access only their own parent profile", () => {
    it("returns exactly one profile row: the caller's", async () => {
      const rows = await db.asUser(f.parentA, (q) => q("select id from public.profiles"))
      expect(rows).toEqual([{ id: f.parentA }])
    })

    it("returns nothing when asking for another parent's profile by id", async () => {
      const rows = await db.asUser(f.parentA, (q) =>
        q("select id from public.profiles where id = $1", [f.parentB])
      )
      expect(rows).toEqual([])
    })

    it("lets a parent rename themselves but not anyone else", async () => {
      const own = await db.asUser(f.parentA, (q) =>
        q("update public.profiles set display_name = 'A. Parent' where id = $1 returning id", [f.parentA])
      )
      expect(own).toHaveLength(1)

      const other = await db.asUser(f.parentA, (q) =>
        q("update public.profiles set display_name = 'Hacked' where id = $1 returning id", [f.parentB])
      )
      expect(other).toEqual([])
      const check = await db.admin<{ display_name: string }>(
        "select display_name from public.profiles where id = $1",
        [f.parentB]
      )
      expect(check[0]?.display_name).toBe("Parent B")
    })

    it("does not let even an administrator list other adults' profiles", async () => {
      const rows = await db.asUser(f.admin, (q) => q("select id from public.profiles"))
      expect(rows).toEqual([{ id: f.admin }])
    })

    it("refuses anonymous visitors", async () => {
      const error = await captureError(db.asAnon((q) => q("select id from public.profiles")))
      expect(error.code).toBe(PERMISSION_DENIED)
    })
  })

  describe("rules 2 & 10 — parents reach only their own children and cannot modify another parent's records", () => {
    it("lists only the caller's children", async () => {
      const rows = await db.asUser(f.parentA, (q) => q("select id from public.child_profiles"))
      expect(rows).toEqual([{ id: f.childA }])
    })

    it("hides another family's child even when its id is known", async () => {
      const rows = await db.asUser(f.parentB, (q) =>
        q("select id, display_name from public.child_profiles where id = $1", [f.childA])
      )
      expect(rows).toEqual([])
    })

    it("silently changes nothing when updating another family's child", async () => {
      const rows = await db.asUser(f.parentB, (q) =>
        q("update public.child_profiles set avatar_key = 'bolt', is_active = false where id = $1 returning id", [
          f.childA,
        ])
      )
      expect(rows).toEqual([])
      const check = await db.admin<{ avatar_key: string; is_active: boolean }>(
        "select avatar_key, is_active from public.child_profiles where id = $1",
        [f.childA]
      )
      expect(check[0]).toEqual({ avatar_key: "rocket", is_active: true })
    })

    it("cannot delete another family's child", async () => {
      const rows = await db.asUser(f.parentB, (q) =>
        q("delete from public.child_profiles where id = $1 returning id", [f.childA])
      )
      expect(rows).toEqual([])
      const check = await db.admin("select 1 from public.child_profiles where id = $1", [f.childA])
      expect(check).toHaveLength(1)
    })

    it("cannot insert a child row directly, for itself or for anyone else", async () => {
      for (const parentId of [f.parentB, f.parentA]) {
        const error = await captureError(
          db.asUser(f.parentB, (q) =>
            q(
              "insert into public.child_profiles (parent_id, display_name, avatar_key, age_band) values ($1, 'SwiftFox11', 'star', '8-12')",
              [parentId]
            )
          )
        )
        expect(error.code).toBe(PERMISSION_DENIED)
      }
    })

    it("cannot re-parent a child (steal it or give it away)", async () => {
      const error = await captureError(
        db.asUser(f.parentB, (q) =>
          q("update public.child_profiles set parent_id = $1 where id = $2", [f.parentA, f.childB])
        )
      )
      expect(error.code).toBe(PERMISSION_DENIED)
    })

    it("cannot read or forge another parent's consent records", async () => {
      const rows = await db.asUser(f.parentB, (q) =>
        q("select id from public.parental_consents where child_profile_id = $1", [f.childA])
      )
      expect(rows).toEqual([])

      const error = await captureError(
        db.asUser(f.parentB, (q) =>
          q(
            "insert into public.parental_consents (parent_id, child_profile_id, consent_type, policy_version) values ($1, $2, 'leaderboard_display', 'x')",
            [f.parentA, f.childA]
          )
        )
      )
      expect(error.code).toBe(PERMISSION_DENIED)
    })

    it("cannot switch on leaderboard visibility for another family's child", async () => {
      const error = await captureError(
        db.rpc(f.parentB, "set_leaderboard_visibility", [f.childA, true, "v1"])
      )
      expect(error.code).toBe(PERMISSION_DENIED)
      expect(error.message).toContain("aie:child_not_found")
    })

    it("keeps children private from administrators too", async () => {
      const rows = await db.asUser(f.admin, (q) => q("select id from public.child_profiles"))
      expect(rows).toEqual([])
    })
  })

  describe("rule 3 — parents can read the progress and quiz history of their own children", () => {
    it("reads lesson progress, attempts, responses and the XP ledger", async () => {
      const result = await db.asUser(f.parentA, async (q) => ({
        progress: await q("select lesson_completed from public.lesson_progress where child_profile_id = $1", [f.childA]),
        attempts: await q("select score, correct_answers, total_questions from public.quiz_attempts where child_profile_id = $1", [f.childA]),
        responses: await q("select is_correct from public.quiz_responses where attempt_id = $1", [attemptOfChildA]),
        ledger: await q("select points from public.points_ledger where child_profile_id = $1", [f.childA]),
      }))
      expect(result.progress).toEqual([{ lesson_completed: true }])
      expect(result.attempts).toEqual([{ score: 80, correct_answers: 4, total_questions: 5 }])
      expect(result.responses).toHaveLength(5)
      expect(result.ledger.length).toBeGreaterThan(0)
    })

    it("reads the summary through get_child_summary", async () => {
      const summary = await db.rpc<{ total_xp: number; lessons_completed: number; accuracy_percent: number }>(
        f.parentA,
        "get_child_summary",
        [f.childA]
      )
      expect(summary.lessons_completed).toBe(1)
      expect(summary.accuracy_percent).toBe(80)
      expect(summary.total_xp).toBe(await totalXp(db, f.childA))
    })
  })

  describe("rule 4 — a child's private records are invisible to unrelated accounts", () => {
    it.each(LEARNER_TABLES)("parent B sees no rows of child A in %s", async (table) => {
      const all = await db.asUser(f.parentB, (q) => q(`select * from public.${table}`))
      expect(all).toEqual([])
      const targeted = await db.asUser(f.parentB, (q) =>
        q(`select * from public.${table} where child_profile_id = $1`, [f.childA])
      )
      expect(targeted).toEqual([])
    })

    it("parent B cannot read child A's individual quiz answers", async () => {
      const rows = await db.asUser(f.parentB, (q) =>
        q("select * from public.quiz_responses where attempt_id = $1", [attemptOfChildA])
      )
      expect(rows).toEqual([])
    })

    it.each([
      ["get_child_summary", (x: Families) => [x.childA]],
      ["get_weekly_leaderboard", (x: Families) => [x.childA, 10]],
      ["get_daily_challenge", (x: Families) => [x.childA]],
      ["complete_lesson", (x: Families) => [x.childA, seedIds.lesson(LESSON_B)]],
      ["record_lesson_progress", (x: Families) => [x.childA, seedIds.lesson(LESSON_B), false]],
      ["start_quiz_attempt", (x: Families) => [x.childA, seedIds.quiz(LESSON_B)]],
      ["submit_daily_challenge", (x: Families) => [x.childA, seedIds.option(LESSON_A, 1, 1)]],
    ] as const)("parent B cannot call %s for child A", async (fn, args) => {
      const before = await totalXp(db, f.childA)
      const error = await captureError(db.rpc(f.parentB, fn, [...args(f)]))
      expect(error.code).toBe(PERMISSION_DENIED)
      expect(error.message).toContain("aie:child_not_found")
      expect(await totalXp(db, f.childA)).toBe(before)
    })

    it("parent B cannot answer or finish child A's quiz attempt", async () => {
      const open = await db.rpc<{ attempt_id: string }>(f.parentA, "start_quiz_attempt", [
        f.childA,
        seedIds.quiz(LESSON_B),
      ])
      const quizB = await getQuizKey(db, LESSON_B)
      const question = quizB.questions[0]!

      const answer = await captureError(
        db.rpc(f.parentB, "answer_quiz_question", [open.attempt_id, question.id, question.correctOptionId])
      )
      expect(answer.code).toBe(PERMISSION_DENIED)

      const finish = await captureError(db.rpc(f.parentB, "complete_quiz_attempt", [open.attempt_id]))
      expect(finish.code).toBe(PERMISSION_DENIED)

      const finishDone = await captureError(db.rpc(f.parentB, "complete_quiz_attempt", [attemptOfChildA]))
      expect(finishDone.code).toBe(PERMISSION_DENIED)
    })

    it("administrators cannot browse learner records either", async () => {
      for (const table of LEARNER_TABLES) {
        const rows = await db.asUser(f.admin, (q) => q(`select * from public.${table}`))
        expect(rows).toEqual([])
      }
    })

    it("anonymous visitors are refused outright", async () => {
      for (const table of [...LEARNER_TABLES, "child_profiles", "quiz_responses"]) {
        const error = await captureError(db.asAnon((q) => q(`select * from public.${table}`)))
        expect(error.code).toBe(PERMISSION_DENIED)
      }
    })
  })

  describe("rule 5 — published content is readable according to the access rules", () => {
    it("signed-in parents read published lessons, quizzes, questions and options", async () => {
      const result = await db.asUser(f.parentA, async (q) => ({
        lessons: await q("select id from public.lessons"),
        quizzes: await q("select id from public.quizzes"),
        questions: await q("select id, question_text from public.quiz_questions where quiz_id = $1", [quizA.quizId]),
        options: await q("select id, option_text from public.quiz_options where question_id = $1", [quizA.questions[0]!.id]),
      }))
      expect(result.lessons).toHaveLength(12)
      expect(result.quizzes).toHaveLength(12)
      expect(result.questions).toHaveLength(5)
      expect(result.options).toHaveLength(4)
    })

    it("anonymous visitors can read world names only, never lessons or quizzes", async () => {
      const worlds = await db.asAnon((q) => q("select slug from public.learning_worlds"))
      expect(worlds).toHaveLength(6)
      for (const table of ["lessons", "quizzes", "quiz_questions", "quiz_options", "achievements", "content_versions"]) {
        const error = await captureError(db.asAnon((q) => q(`select id from public.${table}`)))
        expect(error.code).toBe(PERMISSION_DENIED)
      }
    })

    it("anonymous visitors cannot call any API function", async () => {
      const error = await captureError(
        db.asAnon((q) => q("select public.get_child_summary($1)", [f.childA]))
      )
      expect(error.code).toBe(PERMISSION_DENIED)
    })
  })

  describe("the answer key never reaches a browser", () => {
    it.each([f => f.parentA, f => f.admin] as ((x: Families) => string)[])(
      "is_correct and explanation cannot be selected (caller %#)",
      async (who) => {
        const user = who(f)
        for (const sql of [
          "select is_correct from public.quiz_options",
          "select * from public.quiz_options",
          "select id from public.quiz_options where is_correct",
          "select id from public.quiz_options order by is_correct desc",
          "select explanation from public.quiz_questions",
          "select * from public.quiz_questions",
        ]) {
          const error = await captureError(db.asUser(user, (q) => q(sql)))
          expect(error.code, sql).toBe(PERMISSION_DENIED)
        }
      }
    )

    it("content version snapshots (which contain the key) are unreadable", async () => {
      const error = await captureError(
        db.asUser(f.parentA, (q) => q("select content_snapshot from public.content_versions"))
      )
      expect(error.code).toBe(PERMISSION_DENIED)
    })

    it("internal helpers that expose the key are not callable", async () => {
      for (const sql of [
        `select app_private.lesson_document('${quizA.lessonId}')`,
        `select app_private.daily_question_id('8-12', current_date)`,
      ]) {
        const error = await captureError(db.asUser(f.parentA, (q) => q(sql)))
        expect(error.code, sql).toBe(PERMISSION_DENIED)
      }
    })

    it("the daily challenge is served without its answer", async () => {
      const fresh = await db.rpc<{ completed: boolean; result: unknown; question: Record<string, unknown> }>(
        f.parentB,
        "get_daily_challenge",
        [f.childB]
      )
      expect(fresh.completed).toBe(false)
      expect(fresh.result).toBeNull()
      expect(JSON.stringify(fresh.question)).not.toMatch(/is_correct|explanation|correct_option/)
    })
  })

  describe("rules 8 & 9 — XP can only be awarded by trusted server-side logic", () => {
    it("the points ledger rejects direct inserts, updates and deletes", async () => {
      const before = await totalXp(db, f.childA)
      for (const sql of [
        `insert into public.points_ledger (child_profile_id, event_type, reference_id, points) values ('${f.childA}', 'lesson_completed', gen_random_uuid(), 1000)`,
        `update public.points_ledger set points = 1000 where child_profile_id = '${f.childA}'`,
        `delete from public.points_ledger where child_profile_id = '${f.childA}'`,
      ]) {
        const error = await captureError(db.asUser(f.parentA, (q) => q(sql)))
        expect(error.code, sql).toBe(PERMISSION_DENIED)
      }
      expect(await totalXp(db, f.childA)).toBe(before)
    })

    it("the internal award function is not callable through the API", async () => {
      const error = await captureError(
        db.asUser(f.parentA, (q) =>
          q("select app_private.award_points($1, 'daily_challenge', gen_random_uuid())", [f.childA])
        )
      )
      expect(error.code).toBe(PERMISSION_DENIED)
    })

    it("scores, progress, streaks and achievements cannot be edited directly", async () => {
      for (const sql of [
        `update public.quiz_attempts set score = 100, correct_answers = 5 where id = '${attemptOfChildA}'`,
        `insert into public.quiz_attempts (child_profile_id, quiz_id, total_questions, score, correct_answers, completed_at) values ('${f.childA}', '${quizA.quizId}', 5, 100, 5, now())`,
        `update public.quiz_responses set is_correct = true where attempt_id = '${attemptOfChildA}'`,
        `insert into public.lesson_progress (child_profile_id, lesson_id, lesson_completed, completed_at) values ('${f.childA}', '${seedIds.lesson(LESSON_B)}', true, now())`,
        `update public.learning_streaks set current_streak = 365, longest_streak = 365 where child_profile_id = '${f.childA}'`,
        `insert into public.child_achievements (child_profile_id, achievement_id) values ('${f.childA}', '${seedIds.achievement("future-ready")}')`,
        `delete from public.daily_challenge_completions where child_profile_id = '${f.childA}'`,
      ]) {
        const error = await captureError(db.asUser(f.parentA, (q) => q(sql)))
        expect(error.code, sql).toBe(PERMISSION_DENIED)
      }
    })
  })

  describe("rule 11 — administrator rights cannot be obtained through client-editable fields", () => {
    it("a parent cannot promote themselves", async () => {
      const error = await captureError(
        db.asUser(f.parentA, (q) => q("update public.profiles set role = 'admin' where id = $1", [f.parentA]))
      )
      expect(error.code).toBe(PERMISSION_DENIED)
      const check = await db.admin<{ role: string }>("select role from public.profiles where id = $1", [f.parentA])
      expect(check[0]?.role).toBe("parent")
    })

    it("a parent cannot create a second, privileged profile row", async () => {
      const error = await captureError(
        db.asUser(f.parentA, (q) =>
          q("insert into public.profiles (id, role, display_name) values (gen_random_uuid(), 'admin', 'x')")
        )
      )
      expect(error.code).toBe(PERMISSION_DENIED)
    })

    it("a role smuggled into sign-up metadata is ignored", async () => {
      const sneaky = await db.createUser("sneaky@example.test", {
        display_name: "Sneaky",
        role: "admin",
        is_admin: true,
        app_role: "admin",
      })
      const check = await db.admin<{ role: string }>("select role from public.profiles where id = $1", [sneaky])
      expect(check[0]?.role).toBe("parent")
      const isAdmin = await db.asUser(sneaky, (q) => q<{ ok: boolean }>("select app_private.is_admin() as ok"))
      expect(isAdmin[0]?.ok).toBe(false)
    })

    it("role claims added to the session token grant nothing", async () => {
      // Authorisation never reads a role from the token; it looks the caller up
      // in profiles. user_metadata in particular is editable by the user.
      const forged = {
        user_role: "admin",
        is_admin: true,
        app_metadata: { role: "admin" },
        user_metadata: { role: "admin" },
      }
      const error = await captureError(
        db.asUser(f.parentA, (q) => q("select public.admin_content_overview()"), forged)
      )
      expect(error.code).toBe(PERMISSION_DENIED)

      const isAdmin = await db.asUser(
        f.parentA,
        (q) => q<{ ok: boolean }>("select app_private.is_admin() as ok"),
        forged
      )
      expect(isAdmin[0]?.ok).toBe(false)

      const drafts = await db.asUser(
        f.parentA,
        (q) => q("select id from public.lessons where status <> 'published'"),
        forged
      )
      expect(drafts).toEqual([])
    })

    it("the role guard still holds if a future migration accidentally grants UPDATE on role", async () => {
      await db.admin("grant update (role) on public.profiles to authenticated")
      try {
        const error = await captureError(
          db.asUser(f.parentA, (q) => q("update public.profiles set role = 'admin' where id = $1", [f.parentA]))
        )
        expect(error.code).toBe(PERMISSION_DENIED)
        expect(error.message).toContain("aie:role_change_not_permitted")
      } finally {
        await db.admin("revoke update (role) on public.profiles from authenticated")
      }
    })
  })
})
