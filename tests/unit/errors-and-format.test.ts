import { describe, expect, it } from "vitest"
import { readSupabaseEnv } from "@/config/env"
import { describeAuthError, describeDbError, domainErrorCode } from "@/lib/errors"
import { formatDate, percent, pluralise, slugify, toParagraphs } from "@/lib/format"

describe("describeDbError", () => {
  it("maps database error codes to child-safe sentences", () => {
    expect(describeDbError({ message: "aie:child_limit_reached" })).toContain("up to 6")
    expect(describeDbError({ code: "P0001", message: "aie:quiz_incomplete" })).toBe(
      "Answer every question before finishing the quiz."
    )
    expect(describeDbError({ message: "aie:publish_blocked:quiz_missing" })).toBe("Add a quiz before publishing.")
  })

  it("extracts the stable code from a longer message", () => {
    expect(domainErrorCode({ message: 'ERROR: aie:child_not_found (SQLSTATE 42501)' })).toBe("aie:child_not_found")
    expect(domainErrorCode({ message: "something else" })).toBeNull()
    expect(domainErrorCode(null)).toBeNull()
  })

  it("never echoes raw database text to the user", () => {
    const raw = 'relation "public.points_ledger" violates check constraint "points_ledger_points_check"'
    for (const code of ["23514", "42501", "23505", "XX000", undefined]) {
      expect(describeDbError({ code, message: raw })).not.toContain("points_ledger")
    }
    expect(describeDbError({ message: "aie:some_future_code" })).toBe("Something went wrong. Please try again.")
  })
})

describe("describeAuthError", () => {
  it("does not reveal whether an account exists", () => {
    const wrongPassword = describeAuthError({ code: "invalid_credentials", message: "Invalid login credentials" })
    expect(wrongPassword).toBe("That email and password do not match. Please try again.")
    expect(wrongPassword).not.toMatch(/exist|registered|no account/i)
  })

  it("explains rate limits and unconfirmed emails", () => {
    expect(describeAuthError({ code: "over_email_send_rate_limit" })).toContain("Too many attempts")
    expect(describeAuthError({ code: "email_not_confirmed" })).toContain("confirm your email")
  })

  it("falls back to a generic message", () => {
    expect(describeAuthError({ code: "unexpected_failure", message: "pq: connection refused" })).toBe(
      "Something went wrong. Please try again."
    )
  })
})

describe("format helpers", () => {
  it("slugify makes URL-safe names", () => {
    expect(slugify("What Is a Deepfake?")).toBe("what-is-a-deepfake")
    expect(slugify("  AI & Nature: Café!  ")).toBe("ai-nature-cafe")
    expect(slugify("???")).toBe("")
    expect(slugify("a".repeat(200))).toHaveLength(120)
  })

  it("percent is safe with empty totals", () => {
    expect(percent(1, 2)).toBe(50)
    expect(percent(0, 0)).toBe(0)
    expect(percent(5, 2)).toBe(100)
    expect(percent(Number.NaN, 2)).toBe(0)
  })

  it("pluralise and toParagraphs", () => {
    expect(pluralise(1, "lesson")).toBe("1 lesson")
    expect(pluralise(0, "quiz", "quizzes")).toBe("0 quizzes")
    expect(toParagraphs("One.\n\nTwo.\n\n\n  Three.  ")).toEqual(["One.", "Two.", "Three."])
    expect(toParagraphs("")).toEqual([])
  })

  it("formatDate tolerates missing and invalid values", () => {
    expect(formatDate("2026-11-15T10:00:00Z")).toBe("15 Nov 2026")
    expect(formatDate(null)).toBe("—")
    expect(formatDate("not a date", "none yet")).toBe("none yet")
  })
})

describe("readSupabaseEnv", () => {
  it("returns the configuration when both values are present", () => {
    expect(
      readSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "a".repeat(40),
      })
    ).toEqual({ url: "https://abc.supabase.co", anonKey: "a".repeat(40) })
  })

  it.each([
    {},
    { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "" },
    { NEXT_PUBLIC_SUPABASE_URL: "not a url", NEXT_PUBLIC_SUPABASE_ANON_KEY: "a".repeat(40) },
    { NEXT_PUBLIC_SUPABASE_URL: "ftp://abc.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "a".repeat(40) },
    { NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "short" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co" },
  ])("treats %j as not configured", (raw) => {
    expect(readSupabaseEnv(raw)).toBeNull()
  })
})
