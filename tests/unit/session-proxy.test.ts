// @vitest-environment node
import { NextRequest } from "next/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Route protection and session handling in src/proxy.ts.
 *
 * Supabase itself is replaced by a stub here; what is under test is our own
 * decision logic: who gets redirected where, and that refreshed session
 * cookies survive a redirect.
 */

const getClaims = vi.fn()
let lastCookieAdapter:
  | { getAll: () => unknown[]; setAll: (cookies: { name: string; value: string; options?: object }[], headers?: Record<string, string>) => void }
  | undefined

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn((_url: string, _key: string, options: { cookies: NonNullable<typeof lastCookieAdapter> }) => {
    lastCookieAdapter = options.cookies
    return { auth: { getClaims } }
  }),
}))

const SIGNED_IN = { data: { claims: { sub: "11111111-1111-4111-8111-111111111111" } }, error: null }
const SIGNED_OUT = { data: null, error: null }

async function run(path: string) {
  const { proxy } = await import("@/proxy")
  return proxy(new NextRequest(new URL(path, "http://localhost:3000")))
}

describe("session proxy", () => {
  beforeEach(() => {
    vi.resetModules()
    getClaims.mockReset()
    lastCookieAdapter = undefined
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key-placeholder-value")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("signed-out visitors", () => {
    beforeEach(() => getClaims.mockResolvedValue(SIGNED_OUT))

    it.each([
      "/child",
      "/child/lessons/what-is-a-deepfake/quiz",
      "/parent",
      "/parent/children",
      "/admin",
      "/admin/lessons/new",
      "/onboarding",
    ])("are redirected from %s to the login page", async (path) => {
      const response = await run(path)
      expect(response.status).toBe(307)
      const location = new URL(response.headers.get("location")!)
      expect(location.pathname).toBe("/login")
      expect(location.searchParams.get("next")).toBe(path)
    })

    it("keeps the query string of the page they wanted", async () => {
      const response = await run("/parent?child=abc")
      expect(new URL(response.headers.get("location")!).searchParams.get("next")).toBe("/parent?child=abc")
    })

    it.each(["/", "/login", "/signup", "/privacy", "/forgot-password", "/reset-password"])(
      "can open the public page %s",
      async (path) => {
        const response = await run(path)
        expect(response.status).toBe(200)
        expect(response.headers.get("location")).toBeNull()
      }
    )
  })

  describe("signed-in users", () => {
    beforeEach(() => getClaims.mockResolvedValue(SIGNED_IN))

    it.each(["/child", "/parent", "/admin", "/onboarding", "/"])("can reach %s", async (path) => {
      const response = await run(path)
      expect(response.status).toBe(200)
    })

    it.each(["/login", "/signup", "/forgot-password"])("are sent from %s to their dashboard", async (path) => {
      const response = await run(path)
      expect(response.status).toBe(307)
      expect(new URL(response.headers.get("location")!).pathname).toBe("/parent")
    })

    it("does not decide who is an administrator: that is checked by the page and the database", async () => {
      // The proxy only knows "signed in". A parent reaching /admin here is then
      // stopped by requireAdmin() (404) and by the admin_* database functions.
      const response = await run("/admin/lessons")
      expect(response.status).toBe(200)
    })
  })

  it("verifies the session on every matched request", async () => {
    getClaims.mockResolvedValue(SIGNED_IN)
    await run("/child")
    await run("/parent")
    expect(getClaims).toHaveBeenCalledTimes(2)
  })

  it("keeps a refreshed session cookie when it redirects", async () => {
    getClaims.mockImplementation(async () => {
      // Supabase rotates the token during the check.
      lastCookieAdapter?.setAll(
        [{ name: "sb-project-auth-token", value: "refreshed", options: { path: "/", httpOnly: true } }],
        { "Cache-Control": "private, no-store" }
      )
      return SIGNED_IN
    })
    const response = await run("/login")
    expect(response.status).toBe(307)
    expect(response.cookies.get("sb-project-auth-token")?.value).toBe("refreshed")
  })

  it("passes the refreshed cookie and cache headers through on a normal request", async () => {
    getClaims.mockImplementation(async () => {
      lastCookieAdapter?.setAll([{ name: "sb-project-auth-token", value: "refreshed", options: { path: "/" } }], {
        "Cache-Control": "private, no-store",
      })
      return SIGNED_IN
    })
    const response = await run("/child")
    expect(response.cookies.get("sb-project-auth-token")?.value).toBe("refreshed")
    expect(response.headers.get("Cache-Control")).toBe("private, no-store")
  })

  it("lets requests through untouched when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "")
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    const response = await run("/child")
    expect(response.status).toBe(200)
    expect(getClaims).not.toHaveBeenCalled()
  })

  it("only skips static assets", async () => {
    const { config } = await import("@/proxy")
    const pattern = new RegExp(`^${config.matcher[0]}$`)
    for (const path of ["/child", "/admin/lessons", "/", "/auth/confirm", "/design-preview/quiz"]) {
      expect(pattern.test(path), path).toBe(true)
    }
    for (const path of ["/_next/static/chunk.js", "/_next/image", "/icon.svg", "/images/hero.png"]) {
      expect(pattern.test(path), path).toBe(false)
    }
  })
})
