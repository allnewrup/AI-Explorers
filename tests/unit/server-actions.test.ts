// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"
import { emptyLessonInput } from "@/features/admin-content/schemas"
import { idleFormState } from "@/lib/action-result"

/**
 * Server Actions are public HTTP endpoints: anyone with a session can call
 * them with any arguments. These tests call them the way an attacker could and
 * check that each one authorises itself and trusts nothing from the caller.
 * (The database enforces the same rules again; see tests/integration.)
 */

const CHILD = "22222222-2222-4222-8222-222222222222"
const OTHER_CHILD = "33333333-3333-4333-8333-333333333333"
const UUID = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`

const session = {
  getProfile: vi.fn(),
  getActiveChild: vi.fn(),
  listChildProfiles: vi.fn(),
}
const rpc = vi.fn()
const tableCalls: { table: string; op: string; payload?: unknown; filters: [string, unknown][] }[] = []
let tableResult: { data: unknown; error: unknown } = { data: [], error: null }
const cookieStore = { set: vi.fn(), delete: vi.fn(), get: vi.fn() }

class RedirectSignal extends Error {
  constructor(public readonly to: string) {
    super(`redirect:${to}`)
  }
}

function from(table: string) {
  const call = { table, op: "select", payload: undefined as unknown, filters: [] as [string, unknown][] }
  tableCalls.push(call)
  const builder = {
    update(payload: unknown) {
      call.op = "update"
      call.payload = payload
      return builder
    },
    insert(payload: unknown) {
      call.op = "insert"
      call.payload = payload
      return builder
    },
    delete() {
      call.op = "delete"
      return builder
    },
    eq(column: string, value: unknown) {
      call.filters.push([column, value])
      return builder
    },
    select() {
      return Promise.resolve(tableResult)
    },
    then(resolve: (value: typeof tableResult) => unknown) {
      return Promise.resolve(tableResult).then(resolve)
    },
  }
  return builder
}

vi.mock("@/lib/auth/session", () => session)
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ rpc, from })) }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((to: string) => {
    throw new RedirectSignal(to)
  }),
}))

function form(values: Record<string, string>) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

async function redirectOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise
  } catch (error) {
    if (error instanceof RedirectSignal) return error.to
    throw error
  }
  throw new Error("expected a redirect")
}

const parent = { id: "p1", role: "parent" as const, displayName: "Sam", email: "sam@example.com" }
const admin = { ...parent, id: "a1", role: "admin" as const }
const activeChild = { id: CHILD, displayName: "CosmicOtter42", avatarKey: "rocket", ageBand: "8-12", isActive: true }

beforeEach(() => {
  rpc.mockReset()
  tableCalls.length = 0
  tableResult = { data: [], error: null }
  for (const mock of Object.values(session)) mock.mockReset()
  for (const mock of Object.values(cookieStore)) mock.mockReset()
})

describe("quiz actions", () => {
  const quizzes = () => import("@/features/quizzes/actions")

  it("take the child from the server session, never from the caller", async () => {
    session.getActiveChild.mockResolvedValue(activeChild)
    rpc.mockResolvedValue({ data: { attempt_id: UUID(9), answered: [] }, error: null })
    const { startQuizAction } = await quizzes()

    const result = await startQuizAction(UUID(1))
    expect(result.ok).toBe(true)
    expect(rpc).toHaveBeenCalledWith("start_quiz_attempt", { p_child_id: CHILD, p_quiz_id: UUID(1) })
  })

  it("send only ids when answering: no score and no correctness flag can be injected", async () => {
    session.getActiveChild.mockResolvedValue(activeChild)
    rpc.mockResolvedValue({
      data: {
        question_id: UUID(2),
        selected_option_id: UUID(3),
        is_correct: false,
        correct_option_id: UUID(4),
        explanation: "Because.",
        already_answered: false,
      },
      error: null,
    })
    const { answerQuestionAction } = await quizzes()

    const hostile = {
      attemptId: UUID(9),
      questionId: UUID(2),
      optionId: UUID(3),
      is_correct: true,
      score: 100,
      points: 9999,
      childId: OTHER_CHILD,
    }
    const result = await answerQuestionAction(hostile)

    expect(result).toMatchObject({ ok: true, data: { is_correct: false } })
    expect(rpc).toHaveBeenCalledWith("answer_quiz_question", {
      p_attempt_id: UUID(9),
      p_question_id: UUID(2),
      p_option_id: UUID(3),
    })
  })

  it.each([
    ["startQuizAction", ["not-a-uuid"]],
    ["completeQuizAction", ["1; drop table quiz_attempts"]],
    ["answerQuestionAction", [{ attemptId: UUID(9), questionId: "x", optionId: UUID(3) }]],
  ] as const)("%s rejects malformed ids before touching the database", async (name, args) => {
    session.getActiveChild.mockResolvedValue(activeChild)
    const quizActions = await quizzes()
    const action = quizActions[name] as (...input: unknown[]) => Promise<{ ok: boolean }>
    expect((await action(...args)).ok).toBe(false)
    expect(rpc).not.toHaveBeenCalled()
  })

  it("refuse to do anything without an active child", async () => {
    session.getActiveChild.mockResolvedValue(null)
    const { startQuizAction, completeQuizAction } = await quizzes()
    expect(await startQuizAction(UUID(1))).toEqual({ ok: false, error: "Choose an explorer profile first." })
    expect((await completeQuizAction(UUID(9))).ok).toBe(false)
    expect(rpc).not.toHaveBeenCalled()
  })

  it("turn a database refusal into a safe message", async () => {
    session.getActiveChild.mockResolvedValue(activeChild)
    rpc.mockResolvedValue({ data: null, error: { code: "42501", message: "aie:attempt_not_found" } })
    const { completeQuizAction } = await quizzes()
    expect(await completeQuizAction(UUID(9))).toEqual({
      ok: false,
      error: "We could not find that quiz attempt.",
    })
  })

  it("fail loudly if the database returns an unexpected shape", async () => {
    session.getActiveChild.mockResolvedValue(activeChild)
    rpc.mockResolvedValue({ data: { score: "lots" }, error: null })
    const { completeQuizAction } = await quizzes()
    await expect(completeQuizAction(UUID(9))).rejects.toThrow(/Unexpected response from complete_quiz_attempt/)
  })
})

describe("lesson and daily-challenge actions", () => {
  it("complete a lesson for the session's child only", async () => {
    session.getActiveChild.mockResolvedValue(activeChild)
    rpc.mockResolvedValue({
      data: { points_awarded: 10, already_completed: false, total_xp: 10, new_achievements: [] },
      error: null,
    })
    const { completeLessonAction } = await import("@/features/lessons/actions")
    const result = await completeLessonAction(UUID(5))
    expect(result).toMatchObject({ ok: true, data: { points_awarded: 10 } })
    expect(rpc).toHaveBeenCalledWith("complete_lesson", { p_child_id: CHILD, p_lesson_id: UUID(5) })
  })

  it("submit the daily challenge with just the chosen option", async () => {
    session.getActiveChild.mockResolvedValue(activeChild)
    rpc.mockResolvedValue({ data: null, error: { message: "aie:option_not_in_question" } })
    const { submitDailyChallengeAction } = await import("@/features/gamification/actions")
    const result = await submitDailyChallengeAction(UUID(6))
    expect(result).toEqual({ ok: false, error: "That answer is not one of the choices." })
    expect(rpc).toHaveBeenCalledWith("submit_daily_challenge", { p_child_id: CHILD, p_option_id: UUID(6) })
  })
})

describe("child profile actions", () => {
  const profiles = () => import("@/features/profiles/actions")
  const validChild = {
    displayName: "CosmicOtter42",
    avatarKey: "rocket",
    ageBand: "8-12",
    consentTerms: "on",
    consentData: "on",
  }

  it("create a profile for the signed-in parent and remember it in an httpOnly cookie", async () => {
    session.getProfile.mockResolvedValue(parent)
    rpc.mockResolvedValue({ data: CHILD, error: null })
    const { createChildProfileAction } = await profiles()

    const to = await redirectOf(
      createChildProfileAction(idleFormState, form({ ...validChild, parent_id: "someone-else", parentId: "someone-else" }))
    )
    expect(to).toBe("/child")

    const [name, args] = rpc.mock.calls[0]!
    expect(name).toBe("create_child_profile")
    expect(args).toEqual({
      p_display_name: "CosmicOtter42",
      p_avatar_key: "rocket",
      p_age_band: "8-12",
      p_show_on_leaderboard: false,
      p_policy_version: expect.any(String),
    })
    expect(JSON.stringify(args)).not.toContain("someone-else")
    expect(cookieStore.set).toHaveBeenCalledWith(
      "aie_active_child",
      CHILD,
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" })
    )
  })

  it("leaderboard visibility is off unless the parent ticks it", async () => {
    session.getProfile.mockResolvedValue(parent)
    rpc.mockResolvedValue({ data: CHILD, error: null })
    const { createChildProfileAction } = await profiles()
    await redirectOf(createChildProfileAction(idleFormState, form({ ...validChild, showOnLeaderboard: "on" })))
    expect(rpc.mock.calls[0]![1]).toMatchObject({ p_show_on_leaderboard: true })
  })

  it("reject a free-text name or missing consent without calling the database", async () => {
    session.getProfile.mockResolvedValue(parent)
    const { createChildProfileAction } = await profiles()

    const badName = await createChildProfileAction(idleFormState, form({ ...validChild, displayName: "Mia Carter" }))
    expect(badName.fieldErrors).toHaveProperty("displayName")

    const noConsent = await createChildProfileAction(idleFormState, form({ ...validChild, consentData: "" }))
    expect(noConsent.fieldErrors).toHaveProperty("consentData")

    expect(rpc).not.toHaveBeenCalled()
    expect(cookieStore.set).not.toHaveBeenCalled()
  })

  it("do nothing for a signed-out caller", async () => {
    session.getProfile.mockResolvedValue(null)
    const { createChildProfileAction } = await profiles()
    const state = await createChildProfileAction(idleFormState, form(validChild))
    expect(state.status).toBe("error")
    expect(rpc).not.toHaveBeenCalled()
  })

  it("switching child ignores an id that is not one of the parent's own children", async () => {
    session.listChildProfiles.mockResolvedValue([activeChild])
    const { selectActiveChildAction } = await profiles()

    const to = await redirectOf(selectActiveChildAction(form({ childId: OTHER_CHILD })))
    expect(to).toBe("/parent/children")
    expect(cookieStore.set).not.toHaveBeenCalled()
  })

  it("switching child refuses a paused profile and accepts an active one", async () => {
    const { selectActiveChildAction } = await profiles()

    session.listChildProfiles.mockResolvedValue([{ ...activeChild, isActive: false }])
    expect(await redirectOf(selectActiveChildAction(form({ childId: CHILD })))).toBe("/parent/children")
    expect(cookieStore.set).not.toHaveBeenCalled()

    session.listChildProfiles.mockResolvedValue([activeChild])
    expect(await redirectOf(selectActiveChildAction(form({ childId: CHILD })))).toBe("/child")
    expect(cookieStore.set).toHaveBeenCalledWith("aie_active_child", CHILD, expect.objectContaining({ httpOnly: true }))
  })

  it("deleting needs the typed confirmation", async () => {
    session.getProfile.mockResolvedValue(parent)
    const { deleteChildProfileAction } = await profiles()

    const unconfirmed = await deleteChildProfileAction(idleFormState, form({ childId: CHILD, confirmation: "delete" }))
    expect(unconfirmed.status).toBe("error")
    expect(tableCalls).toHaveLength(0)

    tableResult = { data: [{ id: CHILD }], error: null }
    const confirmed = await deleteChildProfileAction(idleFormState, form({ childId: CHILD, confirmation: "DELETE" }))
    expect(confirmed.status).toBe("success")
    expect(tableCalls[0]).toMatchObject({ table: "child_profiles", op: "delete", filters: [["id", CHILD]] })
  })

  it("reports 'not found' when row-level security hides the profile being deleted or edited", async () => {
    session.getProfile.mockResolvedValue(parent)
    tableResult = { data: [], error: null } // RLS filtered the row out
    const { deleteChildProfileAction, updateChildProfileAction } = await profiles()

    const deleted = await deleteChildProfileAction(idleFormState, form({ childId: OTHER_CHILD, confirmation: "DELETE" }))
    expect(deleted).toMatchObject({ status: "error", message: "We could not find that explorer profile." })

    const updated = await updateChildProfileAction(idleFormState, form({ ...validChild, childId: OTHER_CHILD }))
    expect(updated).toMatchObject({ status: "error", message: "We could not find that explorer profile." })
  })

  it("editing only ever sends the three safe columns", async () => {
    session.getProfile.mockResolvedValue(parent)
    tableResult = { data: [{ id: CHILD }], error: null }
    const { updateChildProfileAction } = await profiles()

    await updateChildProfileAction(
      idleFormState,
      form({ ...validChild, childId: CHILD, parent_id: "x", is_active: "true", show_on_leaderboard: "true" })
    )
    expect(tableCalls[0]?.payload).toEqual({
      display_name: "CosmicOtter42",
      avatar_key: "rocket",
      age_band: "8-12",
    })
  })
})

describe("admin content actions", () => {
  const adminActions = () => import("@/features/admin-content/actions")
  const lesson = {
    ...emptyLessonInput(UUID(11)),
    title: "What Is Data?",
    slug: "what-is-data",
  }

  it.each([
    ["a parent", parent],
    ["a signed-out caller", null],
  ])("refuse %s before validating or saving anything", async (_label, profile) => {
    session.getProfile.mockResolvedValue(profile)
    const { saveLessonAction, setLessonStatusAction, saveWorldAction } = await adminActions()

    expect(await saveLessonAction(null, lesson)).toEqual({ ok: false, error: "Only administrators can do that." })
    expect(await setLessonStatusAction(UUID(5), "published")).toEqual({
      ok: false,
      error: "Only administrators can do that.",
    })
    const world = await saveWorldAction(idleFormState, form({ title: "X", slug: "x", image_key: "world-future" }))
    expect(world).toMatchObject({ status: "error", message: "Only administrators can do that." })

    expect(rpc).not.toHaveBeenCalled()
    expect(tableCalls).toHaveLength(0)
  })

  it("an administrator saves a validated payload as a draft-preserving upsert", async () => {
    session.getProfile.mockResolvedValue(admin)
    rpc.mockResolvedValue({ data: UUID(5), error: null })
    const { saveLessonAction } = await adminActions()

    const created = await saveLessonAction(null, { ...lesson, status: "published", learning_objectives: ["  Know data.  ", ""] })
    expect(created).toEqual({ ok: true, data: { id: UUID(5) } })

    const [name, args] = rpc.mock.calls[0]!
    expect(name).toBe("admin_upsert_lesson")
    expect(args).not.toHaveProperty("p_lesson_id")
    expect(args.p_payload).not.toHaveProperty("status")
    expect(args.p_payload.learning_objectives).toEqual(["Know data."])

    await saveLessonAction(UUID(5), lesson)
    expect(rpc.mock.calls[1]![1]).toHaveProperty("p_lesson_id", UUID(5))
  })

  it("returns field errors for an invalid lesson without calling the database", async () => {
    session.getProfile.mockResolvedValue(admin)
    const { saveLessonAction } = await adminActions()

    const result = await saveLessonAction(null, {
      ...lesson,
      slug: "Not A Slug",
      quiz: {
        ...lesson.quiz,
        questions: [{ question_text: "Is this valid?", explanation: "", options: [{ option_text: "A", is_correct: false }, { option_text: "B", is_correct: false }] }],
      },
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.fieldErrors).toHaveProperty("slug")
      expect(result.fieldErrors).toHaveProperty("quiz.questions.0.options")
    }
    expect(rpc).not.toHaveBeenCalled()
  })

  it("explains a duplicate URL name and a blocked publish", async () => {
    session.getProfile.mockResolvedValue(admin)
    const { saveLessonAction, setLessonStatusAction } = await adminActions()

    rpc.mockResolvedValueOnce({ data: null, error: { code: "23505", message: "duplicate key" } })
    const duplicate = await saveLessonAction(null, lesson)
    expect(duplicate).toMatchObject({ ok: false, fieldErrors: { slug: ["Choose a different URL name."] } })

    rpc.mockResolvedValueOnce({ data: null, error: { message: "aie:publish_blocked:questions_missing" } })
    const blocked = await setLessonStatusAction(UUID(5), "published")
    expect(blocked).toEqual({ ok: false, error: "Add at least one quiz question before publishing." })
  })

  it("only accepts the three real statuses", async () => {
    session.getProfile.mockResolvedValue(admin)
    const { setLessonStatusAction } = await adminActions()
    expect((await setLessonStatusAction(UUID(5), "live")).ok).toBe(false)
    expect((await setLessonStatusAction("nope", "published")).ok).toBe(false)
    expect(rpc).not.toHaveBeenCalled()
  })
})
