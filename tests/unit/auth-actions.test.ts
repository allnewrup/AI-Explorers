// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"
import { idleFormState } from "@/lib/action-result"

/**
 * Sign-in, sign-up and password-reset server actions, with Supabase replaced
 * by a stub. A real sign-in needs a Supabase project (see tests/e2e/live).
 */

const auth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  getUser: vi.fn(),
}
const cookieStore = { delete: vi.fn(), set: vi.fn(), get: vi.fn(), getAll: vi.fn(() => []) }

class RedirectSignal extends Error {
  constructor(public readonly to: string) {
    super(`redirect:${to}`)
  }
}

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => ({ auth })) }))
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }))
vi.mock("next/navigation", () => ({
  redirect: vi.fn((to: string) => {
    throw new RedirectSignal(to)
  }),
}))
vi.mock("@/config/env", () => ({
  isSupabaseConfigured: () => true,
  getSiteUrl: () => "https://app.example",
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

const actions = () => import("@/features/authentication/actions")

beforeEach(() => {
  for (const mock of Object.values(auth)) mock.mockReset()
  cookieStore.delete.mockReset()
})

describe("parent login", () => {
  it("signs in with valid credentials and continues to the page that was requested", async () => {
    auth.signInWithPassword.mockResolvedValue({ error: null })
    const { signInAction } = await actions()

    const to = await redirectOf(
      signInAction(idleFormState, form({ email: "Sam@Example.com", password: "correct horse 42", next: "/parent/children" }))
    )
    expect(to).toBe("/parent/children")
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "sam@example.com", password: "correct horse 42" })
  })

  it.each(["https://evil.example", "//evil.example", "/login", ""])(
    "ignores the unsafe return address %j",
    async (next) => {
      auth.signInWithPassword.mockResolvedValue({ error: null })
      const { signInAction } = await actions()
      const to = await redirectOf(signInAction(idleFormState, form({ email: "a@b.co", password: "x", next })))
      expect(to).toBe("/parent")
    }
  )

  it("rejects malformed input without contacting the sign-in service", async () => {
    const { signInAction } = await actions()
    const state = await signInAction(idleFormState, form({ email: "not-an-email", password: "" }))
    expect(state.status).toBe("error")
    expect(Object.keys(state.fieldErrors ?? {})).toEqual(expect.arrayContaining(["email", "password"]))
    expect(auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it("gives the same answer for a wrong password and an unknown account, and never echoes the password", async () => {
    auth.signInWithPassword.mockResolvedValue({
      error: { code: "invalid_credentials", message: "Invalid login credentials" },
    })
    const { signInAction } = await actions()
    const state = await signInAction(idleFormState, form({ email: "a@b.co", password: "wrong password 1" }))

    expect(state).toMatchObject({
      status: "error",
      message: "That email and password do not match. Please try again.",
      values: { email: "a@b.co" },
    })
    expect(JSON.stringify(state)).not.toContain("wrong password 1")
  })
})

describe("parent sign-up", () => {
  const valid = {
    displayName: "Sam Parent",
    email: "sam@example.com",
    password: "correct horse 42",
    acceptTerms: "on",
  }

  it("sends only a display name as profile data — never a role", async () => {
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null })
    const { signUpAction } = await actions()

    const state = await signUpAction(idleFormState, form({ ...valid, role: "admin", is_admin: "true" }))
    expect(state.status).toBe("success")

    const call = auth.signUp.mock.calls[0]![0]
    expect(call.options.data).toEqual({ display_name: "Sam Parent" })
    expect(call.options.emailRedirectTo).toBe("https://app.example/auth/confirm?next=%2Fonboarding")
  })

  it("goes straight to onboarding when email confirmation is switched off", async () => {
    auth.signUp.mockResolvedValue({ data: { session: { access_token: "t" } }, error: null })
    const { signUpAction } = await actions()
    expect(await redirectOf(signUpAction(idleFormState, form(valid)))).toBe("/onboarding")
  })

  it("requires the adult confirmation and a strong password", async () => {
    const { signUpAction } = await actions()
    const state = await signUpAction(idleFormState, form({ ...valid, password: "short", acceptTerms: "" }))
    expect(state.status).toBe("error")
    expect(Object.keys(state.fieldErrors ?? {})).toEqual(expect.arrayContaining(["password", "acceptTerms"]))
    expect(state.values).toEqual({ displayName: "Sam Parent", email: "sam@example.com" })
    expect(auth.signUp).not.toHaveBeenCalled()
  })
})

describe("password reset", () => {
  it("answers identically whether or not the address is registered", async () => {
    const { requestPasswordResetAction } = await actions()

    auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null })
    const known = await requestPasswordResetAction(idleFormState, form({ email: "known@example.com" }))

    auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { code: "user_not_found", message: "User not found" } })
    const unknown = await requestPasswordResetAction(idleFormState, form({ email: "unknown@example.com" }))

    expect(known.status).toBe("success")
    expect(unknown).toEqual(known)
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("known@example.com", {
      redirectTo: "https://app.example/auth/confirm?next=%2Freset-password",
    })
  })

  it("does tell the user about rate limiting", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: { code: "over_email_send_rate_limit", message: "rate limit" } })
    const { requestPasswordResetAction } = await actions()
    const state = await requestPasswordResetAction(idleFormState, form({ email: "a@b.co" }))
    expect(state).toMatchObject({ status: "error" })
    expect(state.message).toContain("Too many attempts")
  })

  it("refuses to set a password without a signed-in reset session", async () => {
    auth.getUser.mockResolvedValue({ data: { user: null } })
    const { updatePasswordAction } = await actions()
    const state = await updatePasswordAction(
      idleFormState,
      form({ password: "correct horse 42", confirmPassword: "correct horse 42" })
    )
    expect(state.message).toContain("expired")
    expect(auth.updateUser).not.toHaveBeenCalled()
  })

  it("updates the password for a valid reset session", async () => {
    auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } })
    auth.updateUser.mockResolvedValue({ error: null })
    const { updatePasswordAction } = await actions()
    const to = await redirectOf(
      updatePasswordAction(idleFormState, form({ password: "correct horse 42", confirmPassword: "correct horse 42" }))
    )
    expect(to).toBe("/parent")
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "correct horse 42" })
  })
})

describe("logout", () => {
  it("ends the session, forgets the active child and returns to the home page", async () => {
    auth.signOut.mockResolvedValue({ error: null })
    const { signOutAction } = await actions()
    expect(await redirectOf(signOutAction())).toBe("/")
    expect(auth.signOut).toHaveBeenCalledTimes(1)
    expect(cookieStore.delete).toHaveBeenCalledWith("aie_active_child")
  })
})
