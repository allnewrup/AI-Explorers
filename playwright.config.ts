import { defineConfig, devices } from "@playwright/test"

/**
 * End-to-end tests run against production builds.
 *
 * Two builds are always made, each in its own folder under .next-e2e/ so your
 * normal `.next` build is never touched:
 *
 *   placeholder   Supabase "configured" with an address where nothing is
 *                 listening. Exercises routing, redirects, form validation,
 *                 responsive layout and accessibility. The design preview is
 *                 enabled in this build only.
 *   unconfigured  No Supabase settings at all. Proves the app says so plainly
 *                 instead of faking a backend.
 *
 * Both set their environment explicitly, so a developer's real .env.local is
 * never used and no test can reach a real project.
 *
 * A third, optional build runs the signed-in journey against a real Supabase
 * project: see tests/e2e/live/README.md. It is skipped unless E2E_LIVE=1.
 */

const PLACEHOLDER_PORT = Number(process.env.E2E_PORT ?? 3100)
const UNCONFIGURED_PORT = PLACEHOLDER_PORT + 1
const LIVE_PORT = PLACEHOLDER_PORT + 2

const placeholderUrl = `http://localhost:${PLACEHOLDER_PORT}`
const unconfiguredUrl = `http://localhost:${UNCONFIGURED_PORT}`
const liveUrl = `http://localhost:${LIVE_PORT}`

const runLive = process.env.E2E_LIVE === "1"

const common = {
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_TSCONFIG_PATH: "tsconfig.e2e.json",
}

function server(name: string, port: number, env: Record<string, string>) {
  return {
    name,
    // Builds (one build at a time, see the script) and then serves.
    command: `node scripts/e2e-serve.mjs ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 420_000,
    stdout: "ignore" as const,
    stderr: "pipe" as const,
    env: { ...common, NEXT_DIST_DIR: `.next-e2e/${name}`, ...env },
  }
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: ["**/unconfigured.spec.ts", "**/live/**"],
      use: { ...devices["Desktop Chrome"], baseURL: placeholderUrl },
    },
    {
      name: "mobile",
      testIgnore: ["**/unconfigured.spec.ts", "**/live/**"],
      use: { ...devices["Pixel 7"], baseURL: placeholderUrl },
    },
    {
      name: "unconfigured",
      testMatch: "**/unconfigured.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: unconfiguredUrl },
    },
    ...(runLive
      ? [
          {
            name: "live",
            testMatch: "**/live/**/*.spec.ts",
            use: { ...devices["Desktop Chrome"], baseURL: liveUrl },
          },
        ]
      : []),
  ],
  webServer: [
    server("placeholder", PLACEHOLDER_PORT, {
      // Nothing listens here: any accidental network call fails fast.
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54399",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder-anon-key-for-e2e-tests-only",
      NEXT_PUBLIC_SITE_URL: placeholderUrl,
      ENABLE_DESIGN_PREVIEW: "1",
    }),
    server("unconfigured", UNCONFIGURED_PORT, {
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      NEXT_PUBLIC_SITE_URL: unconfiguredUrl,
    }),
    // Uses your real settings from .env.local.
    ...(runLive ? [server("live", LIVE_PORT, { NEXT_PUBLIC_SITE_URL: liveUrl })] : []),
  ],
})
