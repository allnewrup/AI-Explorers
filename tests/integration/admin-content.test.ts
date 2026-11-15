/**
 * Content management: draft/published separation (rule 6), admin-only writes
 * (rule 7), content versioning and storage policies.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { seedIds } from "../../supabase/seed/build-seed"
import { captureError, PERMISSION_DENIED, TestDatabase } from "./helpers/db"
import { createFamilies, getQuizKey, LESSON_A, LESSON_B, playQuiz, type Families } from "./helpers/fixtures"

type LessonDocument = {
  id: string
  title: string
  status: string
  quiz: {
    id: string
    is_published: boolean
    questions: {
      id: string
      question_text: string
      explanation: string
      options: { id: string; option_text: string; is_correct: boolean }[]
    }[]
  } | null
  versions: { version_number: number; status: string; changed_by_name: string | null }[]
}

const WORLD_ID = seedIds.world("ai-beginners")

function lessonPayload(overrides: Record<string, unknown> = {}) {
  return {
    learning_world_id: WORLD_ID,
    title: "How Do Voice Assistants Understand Us?",
    slug: "how-do-voice-assistants-understand-us",
    description: "Find out how a smart speaker turns the sound of your voice into words it can act on.",
    age_band: "8-12",
    difficulty: "beginner",
    estimated_minutes: 8,
    display_order: 3,
    learning_objectives: ["Explain how speech is turned into text.", "  ", "Describe one limit of voice assistants."],
    transcript:
      "A voice assistant listens for a wake word. Then it records what you say and turns the sound into text using a speech model. After that, it works out what you meant and replies.",
    key_terms: [{ term: "Wake word", definition: "The word that tells a voice assistant to start listening." }],
    key_takeaways: ["Speech is turned into text before it is understood."],
    advantages: ["Hands-free help."],
    limitations: ["Can mishear words."],
    safety_notes: ["Ask an adult before using a voice assistant."],
    is_sample: false,
    quiz: {
      title: "Voice assistant quiz",
      instructions: "Two quick questions.",
      passing_score: 50,
      questions: [
        {
          question_text: "What tells a voice assistant to start listening?",
          explanation: "The wake word switches it into listening mode.",
          options: [
            { option_text: "A wake word", is_correct: true },
            { option_text: "A light switch", is_correct: false },
            { option_text: "A loud clap", is_correct: false },
          ],
        },
        {
          question_text: "What does the assistant turn your speech into first?",
          explanation: "Sound is converted to text.",
          options: [
            { option_text: "Music", is_correct: false },
            { option_text: "Text", is_correct: true },
          ],
        },
      ],
    },
    ...overrides,
  }
}

describe("content management", () => {
  let db: TestDatabase
  let f: Families
  let draftId: string

  const getLesson = (id: string) => db.rpc<LessonDocument>(f.admin, "admin_get_lesson", [id])

  /** Everything an ordinary signed-in user could try in order to see a lesson. */
  async function visibleToParent(lessonId: string) {
    return db.asUser(f.parentA, async (q) => ({
      lesson: (await q("select id from public.lessons where id = $1", [lessonId])).length,
      bySlug: (await q("select id from public.lessons where slug = 'how-do-voice-assistants-understand-us'")).length,
      quiz: (await q("select id from public.quizzes where lesson_id = $1", [lessonId])).length,
      questions: (
        await q(
          "select qq.id from public.quiz_questions qq where qq.quiz_id in (select id from public.quizzes where lesson_id = $1)",
          [lessonId]
        )
      ).length,
    }))
  }

  beforeAll(async () => {
    db = await TestDatabase.create()
    f = await createFamilies(db)
  })

  afterAll(async () => {
    await db.close()
  })

  describe("rule 7 — only administrators create, update or publish content", () => {
    it.each([
      ["admin_upsert_lesson", () => [lessonPayload(), null]],
      ["admin_upsert_lesson", () => [lessonPayload(), seedIds.lesson(LESSON_A)]],
      ["admin_set_lesson_status", () => [seedIds.lesson(LESSON_A), "draft"]],
      ["admin_set_lesson_status", () => [seedIds.lesson(LESSON_A), "archived"]],
      ["admin_get_lesson", () => [seedIds.lesson(LESSON_A)]],
      ["admin_content_overview", () => []],
    ])("a parent cannot call %s", async (fn, args) => {
      const error = await captureError(db.rpc(f.parentA, fn, args()))
      expect(error.code).toBe(PERMISSION_DENIED)
      expect(error.message).toContain("aie:admin_required")
    })

    it("a parent's rejected calls changed nothing", async () => {
      const rows = await db.admin<{ status: string; title: string }>(
        "select status::text, title from public.lessons where id = $1",
        [seedIds.lesson(LESSON_A)]
      )
      expect(rows).toEqual([{ status: "published", title: "What Is Artificial Intelligence?" }])
    })

    it("nobody can write content tables directly, not even an administrator", async () => {
      const lesson = seedIds.lesson(LESSON_A)
      for (const user of [f.parentA, f.admin]) {
        for (const sql of [
          `update public.lessons set status = 'published', title = 'Hacked' where id = '${lesson}'`,
          `insert into public.lessons (learning_world_id, title, slug) values ('${WORLD_ID}', 'Injected lesson', 'injected-lesson')`,
          `delete from public.lessons where id = '${lesson}'`,
          `update public.quizzes set is_published = true, passing_score = 0`,
          `update public.quiz_options set is_correct = true`,
          `insert into public.quiz_questions (quiz_id, question_text) values ('${seedIds.quiz(LESSON_A)}', 'Injected question?')`,
          `delete from public.quiz_questions`,
          `insert into public.achievements (title, badge_key, points_threshold) values ('Free badge', 'free-badge', 0)`,
          `insert into public.content_versions (lesson_id, version_number, content_snapshot) values ('${lesson}', 99, '{}')`,
        ]) {
          const error = await captureError(db.asUser(user, (q) => q(sql)))
          expect(error.code, `${user === f.admin ? "admin" : "parent"}: ${sql}`).toBe(PERMISSION_DENIED)
        }
      }
    })

    it("a parent cannot create, rename or deactivate a learning world", async () => {
      const insert = await captureError(
        db.asUser(f.parentA, (q) =>
          q("insert into public.learning_worlds (title, slug, image_key) values ('Fake World', 'fake-world', 'world-future')")
        )
      )
      expect(insert.code).toBe(PERMISSION_DENIED)

      const update = await db.asUser(f.parentA, (q) =>
        q("update public.learning_worlds set title = 'Hacked', is_active = false where id = $1 returning id", [WORLD_ID])
      )
      expect(update).toEqual([])
      const check = await db.admin<{ title: string; is_active: boolean }>(
        "select title, is_active from public.learning_worlds where id = $1",
        [WORLD_ID]
      )
      expect(check[0]).toEqual({ title: "AI Beginners", is_active: true })
    })

    it("an administrator can manage learning worlds", async () => {
      const created = await db.asUser(f.admin, (q) =>
        q<{ id: string }>(
          "insert into public.learning_worlds (title, slug, description, image_key, display_order, is_active) values ('AI and Nature', 'ai-and-nature', 'How AI helps us study animals and plants.', 'world-everyday', 7, false) returning id"
        )
      )
      expect(created).toHaveLength(1)
      const updated = await db.asUser(f.admin, (q) =>
        q("update public.learning_worlds set title = 'AI & Nature' where id = $1 returning title", [created[0]!.id])
      )
      expect(updated).toEqual([{ title: "AI & Nature" }])
    })

    it("an administrator reads the content overview", async () => {
      const overview = await db.rpc<Record<string, number>>(f.admin, "admin_content_overview")
      expect(overview).toMatchObject({
        lessons_total: 12,
        lessons_published: 12,
        lessons_draft: 0,
        lessons_without_video: 12,
        quizzes_total: 12,
        questions_total: 60,
      })
    })
  })

  describe("rule 6 — drafts stay invisible to ordinary users", () => {
    it("an administrator saves a new lesson as a draft, with its quiz and a first version", async () => {
      draftId = await db.rpc<string>(f.admin, "admin_upsert_lesson", [lessonPayload(), null])
      const doc = await getLesson(draftId)

      expect(doc.status).toBe("draft")
      expect(doc.quiz?.is_published).toBe(false)
      expect(doc.quiz?.questions).toHaveLength(2)
      expect(doc.quiz?.questions[0]?.options.filter((o) => o.is_correct)).toHaveLength(1)
      expect(doc.versions).toMatchObject([{ version_number: 1, status: "draft", changed_by_name: "Content Admin" }])
    })

    it("blank list entries are dropped when saving", async () => {
      const rows = await db.admin<{ learning_objectives: string[] }>(
        "select learning_objectives from public.lessons where id = $1",
        [draftId]
      )
      expect(rows[0]?.learning_objectives).toEqual([
        "Explain how speech is turned into text.",
        "Describe one limit of voice assistants.",
      ])
    })

    it("a draft cannot be found by id, by slug, or through its quiz", async () => {
      expect(await visibleToParent(draftId)).toEqual({ lesson: 0, bySlug: 0, quiz: 0, questions: 0 })
    })

    it("a draft cannot be opened, completed or quizzed through the learning functions", async () => {
      const quiz = await db.admin<{ id: string }>("select id from public.quizzes where lesson_id = $1", [draftId])
      for (const [fn, args, message] of [
        ["record_lesson_progress", [f.childA, draftId, false], "aie:lesson_not_available"],
        ["complete_lesson", [f.childA, draftId], "aie:lesson_not_available"],
        ["start_quiz_attempt", [f.childA, quiz[0]!.id], "aie:quiz_not_available"],
      ] as const) {
        const error = await captureError(db.rpc(f.parentA, fn, [...args]))
        expect(error.message, fn).toContain(message)
      }
      const xp = await db.admin("select 1 from public.points_ledger where reference_id = $1", [draftId])
      expect(xp).toEqual([])
    })

    it("draft questions are never chosen for the daily challenge", async () => {
      const rows = await db.admin<{ id: string | null }>(
        `select app_private.daily_question_id('8-12', current_date + offs) as id
         from generate_series(0, 60) as offs`
      )
      const draftQuestions = await db.admin<{ id: string }>(
        "select qq.id from public.quiz_questions qq join public.quizzes q on q.id = qq.quiz_id where q.lesson_id = $1",
        [draftId]
      )
      const draftIds = new Set(draftQuestions.map((row) => row.id))
      expect(rows.some((row) => row.id && draftIds.has(row.id))).toBe(false)
    })

    it("publishing makes the lesson and its quiz visible", async () => {
      await db.rpc(f.admin, "admin_set_lesson_status", [draftId, "published"])
      expect(await visibleToParent(draftId)).toEqual({ lesson: 1, bySlug: 1, quiz: 1, questions: 2 })

      const doc = await getLesson(draftId)
      expect(doc.status).toBe("published")
      expect(doc.quiz?.is_published).toBe(true)
      expect(doc.versions[0]).toMatchObject({ version_number: 2, status: "published" })
    })

    it.each(["draft", "archived"])("moving a published lesson to %s hides it again", async (status) => {
      await db.rpc(f.admin, "admin_set_lesson_status", [draftId, status])
      expect(await visibleToParent(draftId)).toEqual({ lesson: 0, bySlug: 0, quiz: 0, questions: 0 })
      await db.rpc(f.admin, "admin_set_lesson_status", [draftId, "published"])
      expect((await visibleToParent(draftId)).lesson).toBe(1)
    })

    it("deactivating a world hides its published lessons", async () => {
      await db.asUser(f.admin, (q) => q("update public.learning_worlds set is_active = false where id = $1", [WORLD_ID]))
      try {
        const rows = await db.asUser(f.parentA, (q) =>
          q("select id from public.lessons where learning_world_id = $1", [WORLD_ID])
        )
        expect(rows).toEqual([])
        const error = await captureError(db.rpc(f.parentA, "complete_lesson", [f.childA, seedIds.lesson(LESSON_B)]))
        expect(error.message).toContain("aie:lesson_not_available")
      } finally {
        await db.asUser(f.admin, (q) => q("update public.learning_worlds set is_active = true where id = $1", [WORLD_ID]))
      }
    })
  })

  describe("publish validation", () => {
    it.each([
      ["description_missing", { description: "Short" }],
      ["transcript_missing", { transcript: "Too short." }],
      ["objectives_missing", { learning_objectives: [] }],
      ["safety_notes_missing", { safety_notes: [] }],
      ["quiz_missing", { quiz: null }],
      ["questions_missing", { quiz: { title: "Empty", questions: [] } }],
    ])("blocks publishing when %s", async (reason, overrides) => {
      const slug = `incomplete-${reason.replace(/_/g, "-")}`
      const id = await db.rpc<string>(f.admin, "admin_upsert_lesson", [lessonPayload({ slug, ...overrides }), null])
      const error = await captureError(db.rpc(f.admin, "admin_set_lesson_status", [id, "published"]))
      expect(error.message).toContain(`aie:publish_blocked:${reason}`)
      const rows = await db.admin<{ status: string }>("select status::text from public.lessons where id = $1", [id])
      expect(rows[0]?.status).toBe("draft")
    })

    it.each([
      ["no correct option", [{ option_text: "A", is_correct: false }, { option_text: "B", is_correct: false }], "aie:question_needs_one_correct_option"],
      ["two correct options", [{ option_text: "A", is_correct: true }, { option_text: "B", is_correct: true }], "aie:question_needs_one_correct_option"],
      ["a single option", [{ option_text: "A", is_correct: true }], "aie:question_needs_2_to_6_options"],
    ])("rejects a question with %s", async (_label, options, message) => {
      const payload = lessonPayload({
        slug: `bad-quiz-${options.length}-${options.filter((o) => o.is_correct).length}`,
        quiz: { title: "Bad", questions: [{ question_text: "Is this valid?", explanation: "", options }] },
      })
      const error = await captureError(db.rpc(f.admin, "admin_upsert_lesson", [payload, null]))
      expect(error.message).toContain(message)
      // The whole save is rolled back: no half-created lesson is left behind.
      const rows = await db.admin("select 1 from public.lessons where slug = $1", [payload.slug])
      expect(rows).toEqual([])
    })

    it("refuses a save that would leave a live lesson without a usable quiz", async () => {
      const doc = await getLesson(draftId)
      expect(doc.status).toBe("published")
      const error = await captureError(
        db.rpc(f.admin, "admin_upsert_lesson", [lessonPayload({ quiz: { title: "Emptied", questions: [] } }), draftId])
      )
      expect(error.message).toContain("aie:publish_blocked:questions_missing")
      expect((await getLesson(draftId)).quiz?.questions).toHaveLength(2)
    })

    it("rejects a duplicate slug", async () => {
      const error = await captureError(
        db.rpc(f.admin, "admin_upsert_lesson", [lessonPayload({ slug: LESSON_A }), null])
      )
      expect(error.code).toBe("23505")
    })

    it("rejects a question id that belongs to a different quiz", async () => {
      const foreign = (await getQuizKey(db, LESSON_B)).questions[0]!
      const payload = lessonPayload({
        quiz: {
          title: "Hijack",
          questions: [
            {
              id: foreign.id,
              question_text: "Trying to overwrite another quiz's question",
              explanation: "",
              options: [
                { option_text: "A", is_correct: true },
                { option_text: "B", is_correct: false },
              ],
            },
          ],
        },
      })
      const error = await captureError(db.rpc(f.admin, "admin_upsert_lesson", [payload, draftId]))
      expect(error.message).toContain("aie:question_not_in_quiz")
    })
  })

  describe("content versioning preserves learner history", () => {
    it("keeps question ids stable and records a new version on every save", async () => {
      const before = await getLesson(draftId)
      const [first, second] = before.quiz!.questions

      const edited = lessonPayload({
        title: "How Do Voice Assistants Understand Us? (updated)",
        quiz: {
          title: "Voice assistant quiz",
          passing_score: 50,
          questions: [
            {
              id: first!.id,
              question_text: "Which word wakes a voice assistant up?",
              explanation: "It listens for its wake word.",
              // Move the correct answer to a different existing option.
              options: first!.options.map((option, index) => ({
                id: option.id,
                option_text: option.option_text,
                is_correct: index === 1,
              })),
            },
            {
              id: second!.id,
              question_text: second!.question_text,
              explanation: second!.explanation,
              options: second!.options.map((o) => ({ id: o.id, option_text: o.option_text, is_correct: o.is_correct })),
            },
          ],
        },
      })
      await db.rpc(f.admin, "admin_upsert_lesson", [edited, draftId])

      const after = await getLesson(draftId)
      expect(after.title).toContain("(updated)")
      expect(after.quiz!.questions.map((q) => q.id)).toEqual([first!.id, second!.id])
      expect(after.quiz!.questions[0]!.options.map((o) => o.is_correct)).toEqual([false, true, false])
      expect(after.versions[0]!.version_number).toBe(before.versions[0]!.version_number + 1)
      expect(after.status).toBe("published")
    })

    it("an old attempt still shows the question and answers as they were when it was taken", async () => {
      const quiz = await getQuizKey(db, LESSON_A)
      const attempt = await playQuiz(db, f.parentA, f.childA, quiz, 5)
      const original = await db.admin<{ question_text: string; selected_option_text: string }>(
        "select question_text, selected_option_text from public.quiz_responses where attempt_id = $1 order by answered_at",
        [attempt.attempt_id]
      )

      // The admin rewrites the first question and removes the last one.
      const doc = await getLesson(quiz.lessonId)
      const questions = doc.quiz!.questions.slice(0, 4).map((question, index) => ({
        id: question.id,
        question_text: index === 0 ? "Completely rewritten question text?" : question.question_text,
        explanation: question.explanation,
        options: question.options.map((o, optionIndex) => ({
          id: o.id,
          option_text: index === 0 ? `Rewritten option ${optionIndex + 1}` : o.option_text,
          is_correct: o.is_correct,
        })),
      }))
      const row = await db.admin<Record<string, unknown>>("select * from public.lessons where id = $1", [quiz.lessonId])
      await db.rpc(f.admin, "admin_upsert_lesson", [
        { ...row[0], quiz: { title: "Quiz", passing_score: 60, questions } },
        quiz.lessonId,
      ])

      const afterEdit = await db.asUser(f.parentA, (q) =>
        q<{ question_text: string; selected_option_text: string; question_id: string | null }>(
          "select question_text, selected_option_text, question_id from public.quiz_responses where attempt_id = $1 order by answered_at",
          [attempt.attempt_id]
        )
      )
      expect(afterEdit.map(({ question_text, selected_option_text }) => ({ question_text, selected_option_text }))).toEqual(original)
      // The removed question's response survives, detached from the deleted row.
      expect(afterEdit).toHaveLength(5)
      expect(afterEdit[4]?.question_id).toBeNull()

      const stored = await db.admin<{ score: number; version: number }>(
        `select a.score, v.version_number as version
         from public.quiz_attempts a join public.content_versions v on v.id = a.content_version_id
         where a.id = $1`,
        [attempt.attempt_id]
      )
      expect(stored).toEqual([{ score: 100, version: 1 }])

      const snapshot = await db.admin<{ text: string }>(
        `select content_snapshot -> 'quiz' -> 'questions' -> 0 ->> 'question_text' as text
         from public.content_versions where lesson_id = $1 and version_number = 1`,
        [quiz.lessonId]
      )
      expect(snapshot[0]?.text).toBe(original[0]?.question_text)
    })

    it("editing a question does not let a child earn its reward a second time", async () => {
      const quiz = await getQuizKey(db, LESSON_A)
      const before = await db.admin<{ total: number }>(
        "select sum(points)::int as total from public.points_ledger where child_profile_id = $1",
        [f.childA]
      )
      const retake = await playQuiz(db, f.parentA, f.childA, quiz, quiz.questions.length)
      expect(retake.points_awarded).toBe(0)
      const after = await db.admin<{ total: number }>(
        "select sum(points)::int as total from public.points_ledger where child_profile_id = $1",
        [f.childA]
      )
      expect(after[0]?.total).toBe(before[0]?.total)
    })

    it("a lesson with learner history cannot be hard-deleted, even by the database owner", async () => {
      const error = await captureError(
        db.admin("delete from public.lessons where id = $1", [seedIds.lesson(LESSON_A)])
      )
      // 23001 = restrict_violation (ON DELETE RESTRICT on learner history).
      expect(error.code).toBe("23001")
    })
  })

  describe("storage policies", () => {
    const upload = (user: string, bucket: string, name: string) =>
      db.asUser(user, (q) =>
        q("insert into storage.objects (bucket_id, name, owner) values ($1, $2, $3) returning id", [bucket, name, user])
      )

    it("creates the content buckets, with lesson media private", async () => {
      const rows = await db.admin<{ id: string; public: boolean }>(
        "select id, public from storage.buckets order by id"
      )
      expect(rows).toEqual([
        { id: "avatars", public: true },
        { id: "educational-images", public: true },
        { id: "lesson-media", public: false },
        { id: "lesson-thumbnails", public: true },
        { id: "world-illustrations", public: true },
      ])
    })

    it.each(["world-illustrations", "lesson-thumbnails", "avatars", "educational-images", "lesson-media"])(
      "a parent cannot upload to %s",
      async (bucket) => {
        const error = await captureError(upload(f.parentA, bucket, "evil.png"))
        expect(error.code).toBe(PERMISSION_DENIED)
      }
    )

    it("an administrator can upload, and a parent cannot replace or delete the file", async () => {
      await upload(f.admin, "lesson-thumbnails", "thumb.png")
      const updated = await db.asUser(f.parentA, (q) =>
        q("update storage.objects set name = 'defaced.png' where name = 'thumb.png' returning id")
      )
      const deleted = await db.asUser(f.parentA, (q) =>
        q("delete from storage.objects where name = 'thumb.png' returning id")
      )
      expect(updated).toEqual([])
      expect(deleted).toEqual([])
    })

    it("private lesson media is readable only while a visible lesson points at it", async () => {
      await upload(f.admin, "lesson-media", "voice/lesson.mp4")
      await upload(f.admin, "lesson-media", "orphan/unused.mp4")
      const canRead = async () =>
        (
          await db.asUser(f.parentA, (q) =>
            q<{ name: string }>("select name from storage.objects where bucket_id = 'lesson-media' order by name")
          )
        ).map((row) => row.name)

      expect(await canRead()).toEqual([])

      await db.rpc(f.admin, "admin_upsert_lesson", [lessonPayload({ video_asset_key: "voice/lesson.mp4" }), draftId])
      expect(await canRead()).toEqual(["voice/lesson.mp4"])

      await db.rpc(f.admin, "admin_set_lesson_status", [draftId, "draft"])
      expect(await canRead()).toEqual([])
    })
  })
})
