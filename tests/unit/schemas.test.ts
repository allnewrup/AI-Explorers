import { describe, expect, it } from "vitest"
import { emptyLessonInput, lessonInputSchema, worldInputSchema } from "@/features/admin-content/schemas"
import {
  passwordResetRequestSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/features/authentication/schemas"
import { createChildSchema, updateChildSchema } from "@/features/profiles/schemas"

const WORLD_ID = "f6b9b316-b67b-51c0-86cd-b608494a40e5"

describe("sign-up validation", () => {
  const valid = {
    displayName: "Sam Parent",
    email: "Sam@Example.com",
    password: "correct horse 42",
    acceptTerms: true,
  }

  it("accepts a valid parent and lower-cases the email", () => {
    const parsed = signUpSchema.parse(valid)
    expect(parsed.email).toBe("sam@example.com")
  })

  it.each([
    ["short", "Use at least 10 characters."],
    ["onlyletterslong", "Include at least one number."],
    ["12345678901234", "Include at least one letter."],
  ])("rejects the password %j", (password, message) => {
    const result = signUpSchema.safeParse({ ...valid, password })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain(message)
  })

  it("requires the adult/privacy confirmation", () => {
    expect(signUpSchema.safeParse({ ...valid, acceptTerms: false }).success).toBe(false)
  })

  it("rejects a malformed email and an empty name", () => {
    expect(signUpSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false)
    expect(signUpSchema.safeParse({ ...valid, displayName: "   " }).success).toBe(false)
  })

  it("ignores extra fields such as a role", () => {
    const parsed = signUpSchema.parse({ ...valid, role: "admin", is_admin: true })
    expect(parsed).not.toHaveProperty("role")
    expect(parsed).not.toHaveProperty("is_admin")
  })
})

describe("sign-in and password reset validation", () => {
  it("requires an email and a password", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false)
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false)
    expect(signInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true)
    expect(passwordResetRequestSchema.safeParse({ email: "" }).success).toBe(false)
  })

  it("requires the two new passwords to match", () => {
    const mismatch = updatePasswordSchema.safeParse({
      password: "correct horse 42",
      confirmPassword: "correct horse 43",
    })
    expect(mismatch.success).toBe(false)
    expect(mismatch.error?.issues[0]?.path).toEqual(["confirmPassword"])
    expect(
      updatePasswordSchema.safeParse({ password: "correct horse 42", confirmPassword: "correct horse 42" }).success
    ).toBe(true)
  })
})

describe("child profile validation", () => {
  const valid = {
    displayName: "CosmicOtter42",
    avatarKey: "rocket",
    ageBand: "8-12",
    showOnLeaderboard: false,
    consentTerms: true,
    consentData: true,
  }

  it("accepts a generated name, a known avatar and an age band", () => {
    expect(createChildSchema.safeParse(valid).success).toBe(true)
  })

  it.each([
    [{ displayName: "Mia Carter" }, "displayName"],
    [{ avatarKey: "selfie" }, "avatarKey"],
    [{ ageBand: "2015-04-01" }, "ageBand"],
    [{ consentTerms: false }, "consentTerms"],
    [{ consentData: false }, "consentData"],
  ])("rejects %j", (override, field) => {
    const result = createChildSchema.safeParse({ ...valid, ...override })
    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.path[0])).toContain(field)
  })

  it("does not require leaderboard visibility", () => {
    expect(createChildSchema.parse(valid).showOnLeaderboard).toBe(false)
  })

  it("requires a real id when updating", () => {
    expect(updateChildSchema.safeParse({ ...valid, childId: "1 or 1=1" }).success).toBe(false)
  })
})

describe("lesson editor validation", () => {
  const question = {
    question_text: "What is data?",
    explanation: "Examples an AI learns from.",
    options: [
      { option_text: "Examples", is_correct: true },
      { option_text: "Batteries", is_correct: false },
    ],
  }
  const valid = {
    ...emptyLessonInput(WORLD_ID),
    title: "What Is Data?",
    slug: "what-is-data",
    quiz: { title: "", instructions: "", passing_score: 60, questions: [question] },
  }

  it("accepts a minimal draft and drops blank list rows", () => {
    const parsed = lessonInputSchema.parse({
      ...valid,
      learning_objectives: ["  Know what data is.  ", "", "   "],
      key_terms: [
        { term: "Data", definition: "Examples." },
        { term: "", definition: "" },
      ],
    })
    expect(parsed.learning_objectives).toEqual(["Know what data is."])
    expect(parsed.key_terms).toEqual([{ term: "Data", definition: "Examples." }])
  })

  it.each(["What Is Data", "what_is_data", "-what-is-data", "what--is-data", "", "data/../../admin"])(
    "rejects the URL name %j",
    (slug) => {
      expect(lessonInputSchema.safeParse({ ...valid, slug }).success).toBe(false)
    }
  )

  it.each([
    ["no correct answer", [{ option_text: "A", is_correct: false }, { option_text: "B", is_correct: false }]],
    ["two correct answers", [{ option_text: "A", is_correct: true }, { option_text: "B", is_correct: true }]],
    ["one choice", [{ option_text: "A", is_correct: true }]],
    ["a blank choice", [{ option_text: "A", is_correct: true }, { option_text: " ", is_correct: false }]],
  ])("rejects a question with %s", (_label, options) => {
    const result = lessonInputSchema.safeParse({
      ...valid,
      quiz: { ...valid.quiz, questions: [{ ...question, options }] },
    })
    expect(result.success).toBe(false)
  })

  it("rejects a half-filled key term", () => {
    expect(
      lessonInputSchema.safeParse({ ...valid, key_terms: [{ term: "Data", definition: "" }] }).success
    ).toBe(false)
  })

  it("rejects captions without a video, and unsafe storage paths", () => {
    expect(lessonInputSchema.safeParse({ ...valid, captions_asset_key: "a.vtt" }).success).toBe(false)
    expect(lessonInputSchema.safeParse({ ...valid, video_asset_key: "../secret.mp4" }).success).toBe(false)
    expect(lessonInputSchema.safeParse({ ...valid, video_asset_key: "/abs.mp4" }).success).toBe(false)
    expect(
      lessonInputSchema.safeParse({ ...valid, video_asset_key: "lessons/a.mp4", captions_asset_key: "lessons/a.vtt" })
        .success
    ).toBe(true)
  })

  it("does not accept a status: publishing is a separate, validated step", () => {
    const parsed = lessonInputSchema.parse({ ...valid, status: "published", published_at: "2026-01-01" })
    expect(parsed).not.toHaveProperty("status")
    expect(parsed).not.toHaveProperty("published_at")
  })

  it("validates learning worlds", () => {
    const world = {
      title: "AI and Nature",
      slug: "ai-and-nature",
      description: "",
      image_key: "world-future",
      age_band: "8-12",
      display_order: 7,
      is_active: false,
    }
    expect(worldInputSchema.safeParse(world).success).toBe(true)
    expect(worldInputSchema.safeParse({ ...world, image_key: "https://evil.example/x.png" }).success).toBe(false)
    expect(worldInputSchema.safeParse({ ...world, slug: "AI Nature" }).success).toBe(false)
  })
})
