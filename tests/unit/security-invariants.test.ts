// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

/**
 * Whole-codebase guard rails. These read the source files and fail if a
 * change breaks one of the project's security rules, so a regression is caught
 * by the test-suite rather than by a code reviewer's memory.
 */

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const SRC = join(ROOT, "src")

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const sourceFiles = walk(SRC).filter((file) => /\.(ts|tsx)$/.test(file))
const read = (file: string) => readFileSync(file, "utf8")
const rel = (file: string) => relative(ROOT, file)

describe("security invariants", () => {
  it("the web app never references the Supabase service-role key", () => {
    const offenders = sourceFiles.filter((file) => /SERVICE_ROLE|service_role|sb_secret_/i.test(read(file)))
    expect(offenders.map(rel)).toEqual([])
  })

  it("only public configuration is exposed through NEXT_PUBLIC_ variables", () => {
    const names = new Set<string>()
    for (const file of sourceFiles) {
      for (const match of read(file).matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)) names.add(match[0])
    }
    expect([...names].sort()).toEqual([
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SUPABASE_URL",
    ])
  })

  it("nothing is kept in localStorage or sessionStorage (no client-side role or XP flags)", () => {
    const offenders = sourceFiles.filter((file) => /\b(localStorage|sessionStorage)\b/.test(read(file)))
    expect(offenders.map(rel)).toEqual([])
  })

  it("no component injects raw HTML", () => {
    const offenders = sourceFiles.filter((file) => /dangerouslySetInnerHTML|\.innerHTML\s*=/.test(read(file)))
    expect(offenders.map(rel)).toEqual([])
  })

  it("every Supabase data module is server-only", () => {
    const dataModules = sourceFiles.filter(
      (file) => /[/\\]queries\.ts$/.test(file) || /lib[/\\]supabase[/\\]server\.ts$/.test(file) || /lib[/\\]auth[/\\]session\.ts$/.test(file)
    )
    expect(dataModules.length).toBeGreaterThanOrEqual(8)
    const missing = dataModules.filter((file) => !/^import "server-only"/m.test(read(file)))
    expect(missing.map(rel)).toEqual([])
  })

  it("client components never import the server Supabase client or server-only data modules", () => {
    const clientFiles = sourceFiles.filter((file) => /^"use client"/.test(read(file)))
    expect(clientFiles.length).toBeGreaterThan(10)
    const offenders = clientFiles.filter((file) => {
      const source = read(file)
      // `import type` is erased at build time and is safe.
      const valueImports = [...source.matchAll(/^import\s+(?!type\b)[^;]*?from\s+"([^"]+)"/gms)].map((match) => match[1])
      return valueImports.some(
        (specifier) =>
          specifier === "@/lib/supabase/server" ||
          specifier === "@/lib/auth/session" ||
          /\/queries$/.test(specifier ?? "")
      )
    })
    expect(offenders.map(rel)).toEqual([])
  })

  it("every server action module authorises its caller", () => {
    const actionFiles = sourceFiles.filter((file) => /[/\\]actions\.ts$/.test(file))
    expect(actionFiles).toHaveLength(6)
    for (const file of actionFiles) {
      const source = read(file)
      expect(source, rel(file)).toMatch(/^"use server"/)
      const isAuthModule = /features[/\\]authentication[/\\]actions\.ts$/.test(file)
      if (!isAuthModule) {
        // Each exported action must reach an identity check from the DAL.
        expect(source, rel(file)).toMatch(/getProfile|getActiveChild|listChildProfiles/)
        const exported = [...source.matchAll(/export async function (\w+)/g)].map((match) => match[1])
        for (const name of exported) {
          const body = source.slice(source.indexOf(`export async function ${name}`))
          const end = body.indexOf("\nexport async function ", 1)
          const text = end === -1 ? body : body.slice(0, end)
          expect(text, `${rel(file)} → ${name}`).toMatch(/getProfile\(|getActiveChild\(|listChildProfiles\(|isAdmin\(/)
        }
      }
    }
  })

  it("no action accepts a child id, parent id, score or points from the browser for learning writes", () => {
    for (const feature of ["lessons", "quizzes", "gamification"]) {
      const source = read(join(SRC, "features", feature, "actions.ts"))
      const signatures = [...source.matchAll(/export async function \w+\(([^)]*)\)/gs)].map((match) => match[1] ?? "")
      for (const signature of signatures) {
        expect(signature, feature).not.toMatch(/childId|parentId|score|points|isCorrect|xp/i)
      }
      // The child always comes from the server session.
      expect(source).toMatch(/p_child_id: child\.id/)
    }
  })

  it("the app's queries never select the answer key", () => {
    const offenders = sourceFiles
      .filter((file) => !/types[/\\]database\.ts$/.test(file) && !/admin-content[/\\]schemas\.ts$/.test(file))
      .filter((file) => /\.select\([^)]*is_correct/.test(read(file)) || /\.select\(\s*"\*"\s*\)/.test(read(file)))
    expect(offenders.map(rel)).toEqual([])
  })

  it(".env.example contains names only, never values", () => {
    const lines = read(join(ROOT, ".env.example"))
      .split("\n")
      .filter((line) => line.trim() !== "" && !line.trim().startsWith("#"))
    expect(lines.length).toBeGreaterThanOrEqual(3)
    for (const line of lines) expect(line, line).toMatch(/^[A-Z0-9_]+=$/)
    expect(lines).toEqual(
      expect.arrayContaining([
        "NEXT_PUBLIC_SUPABASE_URL=",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
        "SUPABASE_SERVICE_ROLE_KEY=",
      ])
    )
  })

  it("real env files are ignored by Git, and the example is not", () => {
    const gitignore = read(join(ROOT, ".gitignore"))
    expect(gitignore).toMatch(/^\.env\*$/m)
    expect(gitignore).toMatch(/^!\.env\.example$/m)
  })

  it("the design preview is disabled in production builds", () => {
    const page = read(join(SRC, "app", "design-preview", "[screen]", "page.tsx"))
    // Off in production unless a build explicitly opts in (the e2e test build).
    expect(page).toMatch(
      /const isEnabled =\s+process\.env\.NODE_ENV !== "production" \|\| process\.env\.ENABLE_DESIGN_PREVIEW === "1"/
    )
    expect(page).toMatch(/if \(!isEnabled\) notFound\(\)/)
    // The opt-in must never be baked into the project's own configuration.
    for (const file of ["next.config.ts", "package.json", ".env.example"]) {
      expect(read(join(ROOT, file)), file).not.toContain("ENABLE_DESIGN_PREVIEW")
    }
    // Fixtures are only imported by the preview itself.
    const importers = sourceFiles.filter(
      (file) => !/design-preview/.test(file) && /design-preview\/(fixtures|preview-interactive)/.test(read(file))
    )
    expect(importers.map(rel)).toEqual([])
  })
})
