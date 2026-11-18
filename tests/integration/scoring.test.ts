/**
 * Scoring, quiz judging and gamification.
 *
 * The browser is never the authority: every number asserted here is produced
 * by the database functions and read back from stored rows.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { BLOCKED_NAME_WORDS } from "@/config/explorer-names"
import { MAX_CHILD_PROFILES, XP_RULES } from "@/config/gamification"
import { seedIds } from "../../supabase/seed/build-seed"
import { captureError, PERMISSION_DENIED, TestDatabase } from "./helpers/db"
import {
  getQuizKey,
  ledgerCount,
  LESSON_A,
  LESSON_B,
  LESSON_C,
  playQuiz,
  totalXp,
  type AttemptResult,
  type QuizKey,
} from "./helpers/fixtures"

type AnswerFeedback = {
  question_id: string
  selected_option_id: string
  is_correct: boolean
  correct_option_id: string
  explanation: string
  already_answered: boolean
}

describe("scoring and gamification", () => {
  let db: TestDatabase
  let quizA: QuizKey
  let quizB: QuizKey
  let quizC: QuizKey
  let parent: string
  let child: string
  let counter = 0

  beforeAll(async () => {
    db = await TestDatabase.create()
    quizA = await getQuizKey(db, LESSON_A)
    quizB = await getQuizKey(db, LESSON_B)
    quizC = await getQuizKey(db, LESSON_C)
  })

  afterAll(async () => {
    await db.close()
  })

  // Every test gets a brand-new family so XP totals start from zero.
  beforeEach(async () => {
    counter += 1
    parent = await db.createUser(`scoring-${counter}@example.test`, { display_name: "Scoring Parent" })
    child = await db.createChild(parent)
  })

  describe("XP rules", () => {
    it("the database awards exactly the amounts the app displays", async () => {
      const rows = await db.admin<{ lesson: number; quiz: number; answer: number; daily: number; cap: number }>(
        `select app_private.xp_for('lesson_completed') as lesson,
                app_private.xp_for('quiz_completed') as quiz,
                app_private.xp_for('quiz_correct_answer') as answer,
                app_private.xp_for('daily_challenge') as daily,
                app_private.max_child_profiles() as cap`
      )
      expect(rows[0]).toEqual({
        lesson: XP_RULES.lessonCompleted,
        quiz: XP_RULES.quizCompleted,
        answer: XP_RULES.quizCorrectAnswer,
        daily: XP_RULES.dailyChallenge,
        cap: MAX_CHILD_PROFILES,
      })
    })
  })

  describe("lesson completion", () => {
    it("awards 10 XP and stores the completion", async () => {
      const result = await db.rpc<{ points_awarded: number; total_xp: number; already_completed: boolean }>(
        parent,
        "complete_lesson",
        [child, quizA.lessonId]
      )
      expect(result).toMatchObject({ points_awarded: 10, total_xp: 10, already_completed: false })

      const progress = await db.admin<{ lesson_completed: boolean; has_completed_at: boolean }>(
        "select lesson_completed, completed_at is not null as has_completed_at from public.lesson_progress where child_profile_id = $1",
        [child]
      )
      expect(progress).toEqual([{ lesson_completed: true, has_completed_at: true }])
    })

    it("never awards the completion reward twice", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      for (let i = 0; i < 5; i += 1) {
        const again = await db.rpc<{ points_awarded: number; already_completed: boolean }>(
          parent,
          "complete_lesson",
          [child, quizA.lessonId]
        )
        expect(again).toMatchObject({ points_awarded: 0, already_completed: true })
      }
      expect(await totalXp(db, child)).toBe(10)
      expect(await ledgerCount(db, child)).toBe(1)
    })

    it("opening a lesson records a start without awarding anything", async () => {
      await db.rpc(parent, "record_lesson_progress", [child, quizA.lessonId, false])
      await db.rpc(parent, "record_lesson_progress", [child, quizA.lessonId, false])
      const rows = await db.admin<{ lesson_completed: boolean; video_completed: boolean }>(
        "select lesson_completed, video_completed from public.lesson_progress where child_profile_id = $1",
        [child]
      )
      expect(rows).toEqual([{ lesson_completed: false, video_completed: false }])
      expect(await totalXp(db, child)).toBe(0)
    })
  })

  describe("quiz judging", () => {
    it("judges a correct answer on the server and returns the explanation afterwards", async () => {
      const { attempt_id } = await db.rpc<{ attempt_id: string }>(parent, "start_quiz_attempt", [child, quizA.quizId])
      const question = quizA.questions[0]!
      const feedback = await db.rpc<AnswerFeedback>(parent, "answer_quiz_question", [
        attempt_id,
        question.id,
        question.correctOptionId,
      ])
      expect(feedback).toMatchObject({
        is_correct: true,
        selected_option_id: question.correctOptionId,
        correct_option_id: question.correctOptionId,
        already_answered: false,
      })
      expect(feedback.explanation.length).toBeGreaterThan(10)
    })

    it("handles an incorrect answer: marks it wrong and reveals the right option", async () => {
      const { attempt_id } = await db.rpc<{ attempt_id: string }>(parent, "start_quiz_attempt", [child, quizA.quizId])
      const question = quizA.questions[0]!
      const feedback = await db.rpc<AnswerFeedback>(parent, "answer_quiz_question", [
        attempt_id,
        question.id,
        question.wrongOptionId,
      ])
      expect(feedback).toMatchObject({
        is_correct: false,
        selected_option_id: question.wrongOptionId,
        correct_option_id: question.correctOptionId,
      })
    })

    it("treats the first answer as final: a child cannot change it after seeing the feedback", async () => {
      const { attempt_id } = await db.rpc<{ attempt_id: string }>(parent, "start_quiz_attempt", [child, quizA.quizId])
      const question = quizA.questions[0]!
      await db.rpc(parent, "answer_quiz_question", [attempt_id, question.id, question.wrongOptionId])

      const second = await db.rpc<AnswerFeedback>(parent, "answer_quiz_question", [
        attempt_id,
        question.id,
        question.correctOptionId,
      ])
      expect(second).toMatchObject({
        is_correct: false,
        selected_option_id: question.wrongOptionId,
        already_answered: true,
      })

      const stored = await db.admin<{ is_correct: boolean }>(
        "select is_correct from public.quiz_responses where attempt_id = $1",
        [attempt_id]
      )
      expect(stored).toEqual([{ is_correct: false }])
    })

    it("rejects options and questions that do not belong to the quiz", async () => {
      const { attempt_id } = await db.rpc<{ attempt_id: string }>(parent, "start_quiz_attempt", [child, quizA.quizId])
      const q1 = quizA.questions[0]!
      const q2 = quizA.questions[1]!

      const wrongOption = await captureError(
        db.rpc(parent, "answer_quiz_question", [attempt_id, q1.id, q2.correctOptionId])
      )
      expect(wrongOption.message).toContain("aie:option_not_in_question")

      const foreignQuestion = quizB.questions[0]!
      const wrongQuestion = await captureError(
        db.rpc(parent, "answer_quiz_question", [attempt_id, foreignQuestion.id, foreignQuestion.correctOptionId])
      )
      expect(wrongQuestion.message).toContain("aie:question_not_in_quiz")
    })

    it("refuses to finish a quiz with unanswered questions", async () => {
      const { attempt_id } = await db.rpc<{ attempt_id: string }>(parent, "start_quiz_attempt", [child, quizA.quizId])
      const question = quizA.questions[0]!
      await db.rpc(parent, "answer_quiz_question", [attempt_id, question.id, question.correctOptionId])

      const error = await captureError(db.rpc(parent, "complete_quiz_attempt", [attempt_id]))
      expect(error.message).toContain("aie:quiz_incomplete")
      expect(await totalXp(db, child)).toBe(0)
    })

    it("starting twice returns the same unfinished attempt and its saved answers", async () => {
      const first = await db.rpc<{ attempt_id: string; answered: unknown[] }>(parent, "start_quiz_attempt", [child, quizA.quizId])
      const question = quizA.questions[0]!
      await db.rpc(parent, "answer_quiz_question", [first.attempt_id, question.id, question.correctOptionId])

      const second = await db.rpc<{ attempt_id: string; answered: { question_id: string; is_correct: boolean }[] }>(
        parent,
        "start_quiz_attempt",
        [child, quizA.quizId]
      )
      expect(second.attempt_id).toBe(first.attempt_id)
      expect(second.answered).toMatchObject([{ question_id: question.id, is_correct: true }])

      const open = await db.admin(
        "select id from public.quiz_attempts where child_profile_id = $1 and completed_at is null",
        [child]
      )
      expect(open).toHaveLength(1)
    })
  })

  describe("score calculation and persistence", () => {
    it.each([
      [5, 100, true],
      [4, 80, true],
      [3, 60, true],
      [2, 40, false],
      [0, 0, false],
    ])("%i of 5 correct scores %i%% (passed: %s)", async (correct, score, passed) => {
      const result = await playQuiz(db, parent, child, quizA, correct)
      expect(result).toMatchObject({
        score,
        correct_answers: correct,
        total_questions: 5,
        passed,
        points_awarded: XP_RULES.quizCompleted + correct * XP_RULES.quizCorrectAnswer,
        already_completed: false,
      })
    })

    it("stores the attempt and every individual response", async () => {
      const result = await playQuiz(db, parent, child, quizA, 3)

      const attempts = await db.admin<{
        score: number
        correct_answers: number
        total_questions: number
        done: boolean
        has_version: boolean
      }>(
        `select score, correct_answers, total_questions,
                completed_at is not null as done,
                content_version_id is not null as has_version
         from public.quiz_attempts where id = $1`,
        [result.attempt_id]
      )
      expect(attempts).toEqual([
        { score: 60, correct_answers: 3, total_questions: 5, done: true, has_version: true },
      ])

      const responses = await db.admin<{ is_correct: boolean; has_text: boolean }>(
        `select is_correct,
                (char_length(question_text) > 0 and char_length(selected_option_text) > 0
                 and char_length(correct_option_text) > 0) as has_text
         from public.quiz_responses where attempt_id = $1 order by answered_at`,
        [result.attempt_id]
      )
      expect(responses).toHaveLength(5)
      expect(responses.filter((row) => row.is_correct)).toHaveLength(3)
      expect(responses.every((row) => row.has_text)).toBe(true)
    })

    it("a parent can then read the persisted result", async () => {
      const result = await playQuiz(db, parent, child, quizA, 4)
      const rows = await db.asUser(parent, (q) =>
        q("select score, correct_answers from public.quiz_attempts where id = $1", [result.attempt_id])
      )
      expect(rows).toEqual([{ score: 80, correct_answers: 4 }])
    })
  })

  describe("duplicate submission protection", () => {
    it("finishing the same attempt again returns the stored result and awards nothing", async () => {
      const first = await playQuiz(db, parent, child, quizA, 4)
      const xp = await totalXp(db, child)
      const rows = await ledgerCount(db, child)

      for (let i = 0; i < 3; i += 1) {
        const again = await db.rpc<AttemptResult>(parent, "complete_quiz_attempt", [first.attempt_id])
        expect(again).toMatchObject({
          attempt_id: first.attempt_id,
          score: 80,
          points_awarded: 0,
          already_completed: true,
        })
      }
      expect(await totalXp(db, child)).toBe(xp)
      expect(await ledgerCount(db, child)).toBe(rows)
    })

    it("a finished attempt cannot be answered again", async () => {
      const done = await playQuiz(db, parent, child, quizA, 0)
      const question = quizA.questions[0]!
      const error = await captureError(
        db.rpc(parent, "answer_quiz_question", [done.attempt_id, question.id, question.correctOptionId])
      )
      expect(error.message).toContain("aie:attempt_already_completed")
    })

    it("retaking a quiz earns only the points that were missed, never the same points twice", async () => {
      const first = await playQuiz(db, parent, child, quizA, 2)
      expect(first.points_awarded).toBe(5 + 20)

      const second = await playQuiz(db, parent, child, quizA, 5)
      expect(second.attempt_id).not.toBe(first.attempt_id)
      // No second participation reward; three newly-correct questions.
      expect(second.points_awarded).toBe(30)

      const third = await playQuiz(db, parent, child, quizA, 5)
      expect(third.points_awarded).toBe(0)

      const maximum = XP_RULES.quizCompleted + 5 * XP_RULES.quizCorrectAnswer
      expect(await totalXp(db, child)).toBe(maximum)

      const attempts = await db.admin(
        "select id from public.quiz_attempts where child_profile_id = $1 and completed_at is not null",
        [child]
      )
      expect(attempts).toHaveLength(3)
    })

    it("the ledger's unique constraint is the final backstop against double rewards", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      const error = await captureError(
        db.admin(
          "insert into public.points_ledger (child_profile_id, event_type, reference_id, points) values ($1, 'lesson_completed', $2, 10)",
          [child, quizA.lessonId]
        )
      )
      expect(error.code).toBe("23505")
    })

    it("rejects negative, zero and absurd point values at the constraint level", async () => {
      for (const points of [-50, 0, 100000]) {
        const error = await captureError(
          db.admin(
            "insert into public.points_ledger (child_profile_id, event_type, reference_id, points) values ($1, 'lesson_completed', gen_random_uuid(), $2)",
            [child, points]
          )
        )
        expect(error.code).toBe("23514")
      }
    })
  })

  describe("XP totals stay consistent", () => {
    it("total XP always equals the sum of the ledger, with a clear transaction history", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      await playQuiz(db, parent, child, quizA, 3)
      await db.rpc(parent, "complete_lesson", [child, quizB.lessonId])
      const last = await playQuiz(db, parent, child, quizB, 5)

      const expected = 10 + (5 + 30) + 10 + (5 + 50)
      expect(await totalXp(db, child)).toBe(expected)
      expect(last.total_xp).toBe(expected)

      const summary = await db.rpc<Record<string, number>>(parent, "get_child_summary", [child])
      expect(summary).toMatchObject({
        total_xp: expected,
        weekly_xp: expected,
        lessons_completed: 2,
        quiz_attempts: 2,
        quizzes_passed: 2,
        questions_answered: 10,
        correct_answers: 8,
        accuracy_percent: 80,
      })

      const history = await db.asUser(parent, (q) =>
        q<{ event_type: string; n: number; points: number }>(
          `select event_type::text, count(*)::int as n, sum(points)::int as points
           from public.points_ledger where child_profile_id = $1
           group by event_type order by event_type`,
          [child]
        )
      )
      expect(history).toEqual([
        { event_type: "lesson_completed", n: 2, points: 20 },
        { event_type: "quiz_completed", n: 2, points: 10 },
        { event_type: "quiz_correct_answer", n: 8, points: 80 },
      ])
    })

    it("a new child's summary is all zeros with no accuracy yet", async () => {
      const summary = await db.rpc<Record<string, unknown>>(parent, "get_child_summary", [child])
      expect(summary).toMatchObject({
        total_xp: 0,
        lessons_completed: 0,
        quiz_attempts: 0,
        accuracy_percent: null,
        current_streak: 0,
        longest_streak: 0,
        achievements_earned: 0,
      })
    })
  })

  describe("learning streaks", () => {
    const setLastLearning = (daysAgo: number) =>
      db.admin(
        "update public.learning_streaks set last_learning_date = (now() at time zone 'utc')::date - $2::int where child_profile_id = $1",
        [child, daysAgo]
      )
    const streak = async () =>
      (await db.admin<{ current_streak: number; longest_streak: number }>(
        "select current_streak, longest_streak from public.learning_streaks where child_profile_id = $1",
        [child]
      ))[0]

    it("starts at one and does not grow from several activities on the same day", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      await playQuiz(db, parent, child, quizA, 5)
      expect(await streak()).toEqual({ current_streak: 1, longest_streak: 1 })
    })

    it("grows by one for learning on consecutive days and resets after a gap", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      await setLastLearning(1)
      await db.rpc(parent, "complete_lesson", [child, quizB.lessonId])
      expect(await streak()).toEqual({ current_streak: 2, longest_streak: 2 })

      await setLastLearning(3)
      await db.rpc(parent, "complete_lesson", [child, quizC.lessonId])
      expect(await streak()).toEqual({ current_streak: 1, longest_streak: 2 })
    })

    it("reports a lapsed streak as zero without rewriting history", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      await setLastLearning(5)
      const summary = await db.rpc<{ current_streak: number; longest_streak: number }>(
        parent,
        "get_child_summary",
        [child]
      )
      expect(summary).toMatchObject({ current_streak: 0, longest_streak: 1 })
    })
  })

  describe("achievements", () => {
    it("are granted when a threshold is crossed, and only once", async () => {
      const first = await db.rpc<{ new_achievements: { badge_key: string }[] }>(parent, "complete_lesson", [
        child,
        quizA.lessonId,
      ])
      expect(first.new_achievements.map((a) => a.badge_key)).toEqual(["first-steps"])

      const quiz = await playQuiz(db, parent, child, quizA, 5)
      expect(quiz.new_achievements.map((a) => a.badge_key)).toEqual(["curious-mind"])

      const repeat = await db.rpc<{ new_achievements: unknown[] }>(parent, "complete_lesson", [child, quizA.lessonId])
      expect(repeat.new_achievements).toEqual([])

      const earned = await db.asUser(parent, (q) =>
        q("select achievement_id from public.child_achievements where child_profile_id = $1", [child])
      )
      expect(earned).toHaveLength(2)
    })
  })

  describe("daily challenge", () => {
    type Challenge = {
      available: boolean
      completed: boolean
      xp_reward: number
      question: { id: string; options: { id: string }[] }
      result: { is_correct: boolean; correct_option_id: string; selected_option_id: string } | null
      points_awarded?: number
      already_completed?: boolean
    }

    it("awards 15 XP once per day and reports the stored answer afterwards", async () => {
      const challenge = await db.rpc<Challenge>(parent, "get_daily_challenge", [child])
      expect(challenge).toMatchObject({ available: true, completed: false, xp_reward: 15, result: null })
      expect(challenge.question.options).toHaveLength(4)

      const chosen = challenge.question.options[0]!.id
      const first = await db.rpc<Challenge>(parent, "submit_daily_challenge", [child, chosen])
      expect(first).toMatchObject({ completed: true, points_awarded: 15, already_completed: false })
      expect(first.result?.selected_option_id).toBe(chosen)

      const other = challenge.question.options[1]!.id
      const second = await db.rpc<Challenge>(parent, "submit_daily_challenge", [child, other])
      expect(second).toMatchObject({ points_awarded: 0, already_completed: true })
      expect(second.result?.selected_option_id).toBe(chosen)

      expect(await totalXp(db, child)).toBe(15)
      const later = await db.rpc<Challenge>(parent, "get_daily_challenge", [child])
      expect(later.completed).toBe(true)
    })

    it("judges the answer on the server", async () => {
      const challenge = await db.rpc<Challenge>(parent, "get_daily_challenge", [child])
      const key = await db.admin<{ id: string }>(
        "select id from public.quiz_options where question_id = $1 and is_correct",
        [challenge.question.id]
      )
      const result = await db.rpc<Challenge>(parent, "submit_daily_challenge", [child, key[0]!.id])
      expect(result.result).toMatchObject({ is_correct: true, correct_option_id: key[0]!.id })
    })

    it("rejects an option that is not part of today's question", async () => {
      const challenge = await db.rpc<Challenge>(parent, "get_daily_challenge", [child])
      const foreign = await db.admin<{ id: string }>(
        "select id from public.quiz_options where question_id <> $1 limit 1",
        [challenge.question.id]
      )
      const error = await captureError(db.rpc(parent, "submit_daily_challenge", [child, foreign[0]!.id]))
      expect(error.message).toContain("aie:option_not_in_question")
      expect(await totalXp(db, child)).toBe(0)
    })
  })

  describe("leaderboard", () => {
    type Board = {
      entries: { rank: number; display_name: string; avatar_key: string; weekly_xp: number; is_self: boolean }[]
      self: { rank: number | null; weekly_xp: number; visible_to_others: boolean }
    }

    it("shows only opted-in children to other families, and never exposes ids", async () => {
      const visibleParent = await db.createUser(`lb-visible-${counter}@example.test`)
      const visibleChild = await db.createChild(visibleParent, { displayName: "SwiftFalcon21", showOnLeaderboard: true })
      const hiddenParent = await db.createUser(`lb-hidden-${counter}@example.test`)
      const hiddenChild = await db.createChild(hiddenParent, { displayName: "LunarTiger33", showOnLeaderboard: false })

      await playQuiz(db, visibleParent, visibleChild, quizA, 5) // 55 XP
      await playQuiz(db, hiddenParent, hiddenChild, quizA, 4) // 45 XP
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId]) // 10 XP

      const board = await db.rpc<Board>(parent, "get_weekly_leaderboard", [child, 50])
      const names = board.entries.map((entry) => entry.display_name)
      expect(names).toContain("SwiftFalcon21")
      expect(names).not.toContain("LunarTiger33")
      expect(board.entries.filter((entry) => entry.is_self)).toHaveLength(1)
      expect(board.self).toMatchObject({ weekly_xp: 10, visible_to_others: false })

      const serialised = JSON.stringify(board)
      for (const secret of [visibleChild, hiddenChild, child, visibleParent, hiddenParent, parent]) {
        expect(serialised).not.toContain(secret)
      }

      // The hidden child is not shown to the visible family either.
      const other = await db.rpc<Board>(visibleParent, "get_weekly_leaderboard", [visibleChild, 50])
      const otherNames = other.entries.map((entry) => entry.display_name)
      expect(otherNames).not.toContain("LunarTiger33")
      expect(otherNames).not.toContain("CosmicOtter42")
    })

    it("ranks by XP earned through the ledger, highest first", async () => {
      const board = await db.rpc<Board>(parent, "get_weekly_leaderboard", [child, 50])
      const xp = board.entries.map((entry) => entry.weekly_xp)
      expect(xp).toEqual([...xp].sort((a, b) => b - a))
      expect(board.self.rank).toBeNull() // no XP this week yet
    })

    it("changing visibility records and revokes consent", async () => {
      await db.rpc(parent, "set_leaderboard_visibility", [child, true, "policy-v2"])
      await db.rpc(parent, "set_leaderboard_visibility", [child, false, "policy-v2"])
      await db.rpc(parent, "set_leaderboard_visibility", [child, true, "policy-v3"])

      const consents = await db.asUser(parent, (q) =>
        q<{ consent_status: string; policy_version: string; revoked: boolean }>(
          `select consent_status::text, policy_version, revoked_at is not null as revoked
           from public.parental_consents
           where child_profile_id = $1 and consent_type = 'leaderboard_display'
           order by recorded_at`,
          [child]
        )
      )
      expect(consents).toEqual([
        { consent_status: "revoked", policy_version: "policy-v2", revoked: true },
        { consent_status: "granted", policy_version: "policy-v3", revoked: false },
      ])
      const visible = await db.admin<{ show_on_leaderboard: boolean }>(
        "select show_on_leaderboard from public.child_profiles where id = $1",
        [child]
      )
      expect(visible[0]?.show_on_leaderboard).toBe(true)
    })
  })

  describe("child profiles", () => {
    it("creating a child records consent in the same transaction", async () => {
      const consents = await db.asUser(parent, (q) =>
        q<{ consent_type: string; consent_status: string; policy_version: string }>(
          "select consent_type::text, consent_status::text, policy_version from public.parental_consents where child_profile_id = $1 order by consent_type",
          [child]
        )
      )
      expect(consents).toEqual([
        { consent_type: "child_profile_data", consent_status: "granted", policy_version: "test-policy-v1" },
        { consent_type: "terms_and_privacy", consent_status: "granted", policy_version: "test-policy-v1" },
      ])
    })

    it.each(["Space Captain 7", "Mia", "CosmicOtter"])("accepts the typed display name %j", async (name) => {
      await db.createChild(parent, { displayName: name })
    })

    it.each(["mi", "<script>42", "", " Mia", "Mia  Star", "Mia_Star", "12345", "SuperLongExplorerName1", "MegaShitStar", "Big Fu ck"])(
      "rejects the display name %j",
      async (name) => {
        const error = await captureError(db.createChild(parent, { displayName: name }))
        expect(error.message).toContain("aie:invalid_display_name")
      }
    )

    it("a parent can rename, re-avatar and re-band their own child", async () => {
      const rows = await db.asUser(parent, (q) =>
        q(
          "update public.child_profiles set display_name = 'SolarWizard58', avatar_key = 'atom', age_band = '13-15' where id = $1 returning display_name, avatar_key, age_band::text",
          [child]
        )
      )
      expect(rows).toEqual([{ display_name: "SolarWizard58", avatar_key: "atom", age_band: "13-15" }])
    })

    it("blocks every word in the app's blocked list (lists must match)", async () => {
      for (const word of BLOCKED_NAME_WORDS) {
        const rows = await db.admin<{ ok: boolean }>("select app_private.is_valid_explorer_name($1) as ok", [
          `Star${word}`,
        ])
        expect(rows[0]?.ok, word).toBe(false)
      }
    })

    it("rejects renaming a child to a disallowed name through a direct update", async () => {
      const error = await captureError(
        db.asUser(parent, (q) =>
          q("update public.child_profiles set display_name = '<b>Mia</b>' where id = $1", [child])
        )
      )
      expect(error.code).toBe("23514")
    })

    it("enforces the per-family profile limit", async () => {
      const names = ["BravePanda11", "SwiftFox12", "LuckyOwl13", "SunnyKoala14", "ZippyGecko15"]
      for (const name of names) await db.createChild(parent, { displayName: name })
      const error = await captureError(db.createChild(parent, { displayName: "WittyHawk16" }))
      expect(error.message).toContain("aie:child_limit_reached")
    })

    it("a paused profile cannot learn or earn, but its history stays readable", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      await db.asUser(parent, (q) => q("update public.child_profiles set is_active = false where id = $1", [child]))

      for (const [fn, args] of [
        ["complete_lesson", [child, quizB.lessonId]],
        ["start_quiz_attempt", [child, quizA.quizId]],
        ["get_daily_challenge", [child]],
      ] as const) {
        const error = await captureError(db.rpc(parent, fn, [...args]))
        expect(error.message, fn).toContain("aie:child_inactive")
      }
      const summary = await db.rpc<{ total_xp: number }>(parent, "get_child_summary", [child])
      expect(summary.total_xp).toBe(10)
    })

    it("deleting a child erases all of that child's learner data", async () => {
      await db.rpc(parent, "complete_lesson", [child, quizA.lessonId])
      await playQuiz(db, parent, child, quizA, 5)

      const deleted = await db.asUser(parent, (q) =>
        q("delete from public.child_profiles where id = $1 returning id", [child])
      )
      expect(deleted).toHaveLength(1)

      const remaining = await db.admin<{ n: number }>(
        `select (select count(*) from public.lesson_progress where child_profile_id = $1)::int
              + (select count(*) from public.quiz_attempts where child_profile_id = $1)::int
              + (select count(*) from public.points_ledger where child_profile_id = $1)::int
              + (select count(*) from public.child_achievements where child_profile_id = $1)::int
              + (select count(*) from public.learning_streaks where child_profile_id = $1)::int
              + (select count(*) from public.parental_consents where child_profile_id = $1)::int as n`,
        [child]
      )
      expect(remaining[0]?.n).toBe(0)
    })

    it("signed-out requests cannot create a child", async () => {
      const error = await captureError(
        db.asAnon((q) =>
          q("select public.create_child_profile('CosmicOtter42', 'rocket', '8-12', false, 'v1')")
        )
      )
      expect(error.code).toBe(PERMISSION_DENIED)
    })
  })

  it("seed ids used by these tests exist", async () => {
    const rows = await db.admin("select 1 from public.quizzes where id = any($1::uuid[])", [
      [seedIds.quiz(LESSON_A), seedIds.quiz(LESSON_B), seedIds.quiz(LESSON_C)],
    ])
    expect(rows).toHaveLength(3)
  })
})
