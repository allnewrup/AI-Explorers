import { describe, expect, it } from "vitest"
import { isGuestOnlyPath, isProtectedPath, safeNextPath } from "@/lib/auth/paths"

describe("isProtectedPath", () => {
  it.each(["/child", "/child/learn", "/child/lessons/x/quiz", "/parent", "/parent/children", "/admin", "/admin/lessons/new", "/onboarding"])(
    "protects %s",
    (path) => expect(isProtectedPath(path)).toBe(true)
  )

  it.each(["/", "/login", "/signup", "/privacy", "/forgot-password", "/reset-password", "/children", "/administrator", "/parental-advice", "/childcare"])(
    "does not protect %s",
    (path) => expect(isProtectedPath(path)).toBe(false)
  )
})

describe("isGuestOnlyPath", () => {
  it("covers the sign-in pages only", () => {
    expect(isGuestOnlyPath("/login")).toBe(true)
    expect(isGuestOnlyPath("/signup")).toBe(true)
    expect(isGuestOnlyPath("/forgot-password")).toBe(true)
    expect(isGuestOnlyPath("/reset-password")).toBe(false)
    expect(isGuestOnlyPath("/")).toBe(false)
  })
})

describe("safeNextPath", () => {
  it("keeps a same-site path, with its query string", () => {
    expect(safeNextPath("/child/learn")).toBe("/child/learn")
    expect(safeNextPath("/parent?child=abc")).toBe("/parent?child=abc")
  })

  it.each([
    "https://evil.example/steal",
    "//evil.example",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "child/learn",
    "/child\n/learn",
    "",
    null,
    undefined,
    42,
    `/${"a".repeat(600)}`,
  ])("falls back for %j (open-redirect protection)", (value) => {
    expect(safeNextPath(value)).toBe("/parent")
  })

  it("never sends a signed-in user back to an auth page", () => {
    expect(safeNextPath("/login")).toBe("/parent")
    expect(safeNextPath("/signup?x=1")).toBe("/parent")
    expect(safeNextPath("/auth/confirm?code=abc")).toBe("/parent")
  })

  it("normalises dot segments instead of trusting them", () => {
    expect(safeNextPath("/child/../admin")).toBe("/admin")
    expect(safeNextPath("/child/../login")).toBe("/parent")
  })

  it("uses the supplied fallback", () => {
    expect(safeNextPath("//evil.example", "/onboarding")).toBe("/onboarding")
  })
})
