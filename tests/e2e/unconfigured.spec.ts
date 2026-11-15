import { expect, test } from "@playwright/test"
import { expectNoSeriousA11yViolations } from "./helpers/a11y"

/**
 * Runs against a build with NO Supabase settings. The app must say that it is
 * not connected. It must not show a login form that cannot work, sample
 * lessons, or anything that looks like a functioning backend.
 */

test("the landing page still works", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The Future Is AI.")
  await expect(page.locator("#worlds").getByRole("listitem")).toHaveCount(6)
})

for (const path of ["/login", "/signup", "/forgot-password", "/onboarding", "/child", "/child/learn", "/parent", "/admin", "/admin/lessons"]) {
  test(`${path} shows the setup screen, not a simulated app`, async ({ page }) => {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    await expect(page.getByRole("heading", { level: 1, name: "Supabase is not configured" })).toBeVisible()
    await expect(page.getByText(/Nothing here is\s+simulated/)).toBeVisible()
    await expect(page.locator("form")).toHaveCount(0)
    await expect(page.getByText(/XP|CosmicOtter|Welcome back/)).toHaveCount(0)
  })
}

test("the setup screen is accessible and links to the instructions", async ({ page }) => {
  await page.goto("/child")
  await expect(page.getByText("README.md")).toBeVisible()
  await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/")
  await expectNoSeriousA11yViolations(page)
})

test("the design preview does not exist in a normal production build", async ({ page }) => {
  for (const screen of ["child-dashboard", "quiz", "admin-editor"]) {
    const response = await page.goto(`/design-preview/${screen}`)
    expect(response?.status(), screen).toBe(404)
    await expect(page.getByText("Design preview. Invented sample data")).toHaveCount(0)
  }
})
