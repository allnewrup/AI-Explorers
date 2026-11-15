import { expect, test, type Page } from "@playwright/test"
import { expectNoSeriousA11yViolations } from "./helpers/a11y"

/**
 * Runs against the "placeholder" build: Supabase looks configured but nothing
 * answers at its address. That is enough to test routing, redirects and
 * server-side form validation, which all happen before any call to Supabase.
 * Real sign-in is covered by tests/e2e/live (needs a Supabase project).
 */

/** Our form alert. (Next.js also keeps an empty role="alert" route announcer in the page.) */
const formAlert = (page: Page) => page.locator('[data-slot="alert"][role="alert"]')

const PROTECTED = [
  "/child",
  "/child/learn",
  "/child/learn/ai-beginners",
  "/child/lessons/what-is-artificial-intelligence",
  "/child/lessons/what-is-artificial-intelligence/quiz",
  "/child/challenge",
  "/child/progress",
  "/child/leaderboard",
  "/parent",
  "/parent/children",
  "/onboarding",
  "/admin",
  "/admin/lessons",
  "/admin/lessons/new",
  "/admin/worlds",
]

test.describe("protected routes", () => {
  for (const path of PROTECTED) {
    test(`${path} sends a signed-out visitor to the login page`, async ({ page }) => {
      const response = await page.goto(path)
      await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path).replace(/%/g, "%")}`))
      expect(response?.status()).toBe(200)
      await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
      // Nothing from the protected page leaked into the response.
      await expect(page.getByText(/XP|Explorer home|Content overview/)).toHaveCount(0)
    })
  }

  test("the redirect itself is a real HTTP redirect, issued before any page renders", async ({ request }) => {
    const response = await request.get("/admin/lessons", { maxRedirects: 0 })
    expect(response.status()).toBe(307)
    expect(response.headers()["location"]).toContain("/login?next=%2Fadmin%2Flessons")
  })

  test("a forged role cookie or active-child cookie grants nothing", async ({ context, page, baseURL }) => {
    await context.addCookies([
      { name: "role", value: "admin", url: baseURL! },
      { name: "is_admin", value: "true", url: baseURL! },
      { name: "aie_active_child", value: "00000000-0000-4000-8000-000000000001", url: baseURL! },
    ])
    await page.goto("/admin")
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin/)
    await page.goto("/child")
    await expect(page).toHaveURL(/\/login\?next=%2Fchild/)
  })

  test("the email-link endpoint rejects a made-up code and never redirects off-site", async ({ page }) => {
    await page.goto("/auth/confirm?code=not-a-real-code&next=https://evil.example/")
    await expect(page).toHaveURL(/\/login\?notice=link-invalid$/)
    await expect(page.getByText(/That link is no longer valid/)).toBeVisible()
  })
})

test.describe("login form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
  })

  test("is labelled, keyboard-usable and passes automated accessibility checks", async ({ page }) => {
    await expect(page.getByLabel("Email address")).toHaveAttribute("type", "email")
    await expect(page.getByLabel("Password")).toHaveAttribute("type", "password")
    await expect(page.getByLabel("Password")).toHaveAttribute("autocomplete", "current-password")
    await expect(page.getByRole("link", { name: "Forgot your password?" })).toBeVisible()
    await expectNoSeriousA11yViolations(page)
  })

  test("validates on the server and explains each problem next to its field", async ({ page }) => {
    await page.getByRole("button", { name: "Log in" }).click()

    await expect(formAlert(page)).toHaveText("Please check the highlighted fields.")
    const email = page.getByLabel("Email address")
    await expect(email).toHaveAttribute("aria-invalid", "true")
    await expect(page.locator("#email-error")).toHaveText("Enter a valid email address.")
    await expect(page.locator("#password-error")).toHaveText("Enter your password.")
    await expect(email).toHaveAttribute("aria-describedby", /email-error/)
  })

  test("keeps the email but never the password after a failed attempt", async ({ page }) => {
    await page.getByLabel("Email address").fill("parent@example.com")
    await page.getByLabel("Password").fill("a-password-that-is-wrong-1")
    await page.getByRole("button", { name: "Log in" }).click()

    // The placeholder backend is unreachable, so sign-in fails safely.
    await expect(formAlert(page)).toContainText("Something went wrong. Please try again.")
    await expect(page.getByLabel("Email address")).toHaveValue("parent@example.com")
    await expect(page.getByLabel("Password")).toHaveValue("")
    expect(await page.content()).not.toContain("a-password-that-is-wrong-1")
    await expect(page).toHaveURL(/\/login$/)
  })

  test("shows a pending state while submitting", async ({ page }) => {
    await page.getByLabel("Email address").fill("parent@example.com")
    await page.getByLabel("Password").fill("some password 123")
    const button = page.getByRole("button", { name: /Log in|Logging in/ })
    await button.click()
    // Either we catch the pending label, or the request already finished.
    await expect(page.getByRole("button", { name: "Logging in…" }).or(formAlert(page))).toBeVisible()
  })
})

test.describe("sign-up form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup")
  })

  test("is for parents, and enforces a strong password and the adult confirmation", async ({ page }) => {
    await expect(page.getByText(/This account is for a parent or guardian/)).toBeVisible()

    await page.getByLabel("Your name").fill("Sam Parent")
    await page.getByLabel("Email address").fill("sam@example.com")
    await page.getByLabel("Password").fill("short")
    await page.getByRole("button", { name: "Create parent account" }).click()

    await expect(page.locator("#password-error")).toContainText("Use at least 10 characters.")
    await expect(page.locator("#acceptTerms-error")).toContainText("Please confirm you are an adult")
    // What was typed is kept, except the password.
    await expect(page.getByLabel("Your name")).toHaveValue("Sam Parent")
    await expect(page.getByLabel("Email address")).toHaveValue("sam@example.com")
    await expect(page.getByLabel("Password")).toHaveValue("")
  })

  test("does not ask for anything about a child", async ({ page }) => {
    const labels = (await page.locator("label").allInnerTexts()).join(" ").toLowerCase()
    for (const word of ["birth", "child's name", "school", "your child"]) expect(labels).not.toContain(word)

    // Exactly three things to type, plus one tick box. (Hidden inputs that the
    // framework adds for form handling are not fields.)
    const fields = page.locator('form input:not([type="hidden"]):not([aria-hidden="true"])')
    await expect(fields).toHaveCount(3)
    expect(await fields.evaluateAll((inputs) => inputs.map((input) => input.getAttribute("name")))).toEqual([
      "displayName",
      "email",
      "password",
    ])
    await expect(page.getByRole("checkbox")).toHaveCount(1)
  })

  test("passes automated accessibility checks, including after errors appear", async ({ page }) => {
    await expectNoSeriousA11yViolations(page)
    await page.getByRole("button", { name: "Create parent account" }).click()
    await expect(page.locator("#email-error")).toBeVisible()
    await expectNoSeriousA11yViolations(page)
  })
})

test.describe("password reset", () => {
  test("validates the email address", async ({ page }) => {
    await page.goto("/forgot-password")
    await page.getByLabel("Email address").fill("not-an-email")
    await page.getByRole("button", { name: "Send reset link" }).click()
    await expect(page.locator("#email-error")).toHaveText("Enter a valid email address.")
  })

  test("the new-password page refuses to work without a reset session", async ({ page }) => {
    await page.goto("/reset-password")
    await expect(page.getByText(/only works from the link in a password reset email/)).toBeVisible()
    await expect(page.getByLabel("New password")).toHaveCount(0)
    await expect(page.getByRole("link", { name: "Request a new link" })).toHaveAttribute("href", "/forgot-password")
  })
})

test("unknown pages show a friendly not-found screen with a 404 status", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist")
  expect(response?.status()).toBe(404)
  await expect(page.getByRole("heading", { name: "We could not find that page" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Go to the home page" })).toBeVisible()
})
