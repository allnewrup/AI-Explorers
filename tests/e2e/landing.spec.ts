import { expect, test } from "@playwright/test"
import { expectNoSeriousA11yViolations, hasHorizontalOverflow } from "./helpers/a11y"

const WORLDS = [
  "AI Beginners",
  "AI in Everyday Life",
  "AI Creativity Studio",
  "AI Detective Lab",
  "AI Safety School",
  "AI Future Lab",
]

test.describe("landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("introduces the product with the hero headline and a clear call to action", async ({ page }) => {
    await expect(page).toHaveTitle(/AI Explorers/)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("The Future Is AI.")
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Let's Help Kids Understand It.")
    await expect(
      page.getByText("An exciting learning adventure where children discover artificial intelligence")
    ).toBeVisible()
    await expect(page.getByRole("img", { name: /Spark, the AI Explorers robot guide/ })).toBeVisible()

    await page.getByRole("link", { name: "Start exploring" }).click()
    await expect(page).toHaveURL(/\/signup$/)
    await expect(page.getByRole("heading", { name: "Create a parent account" })).toBeVisible()
  })

  test("previews all six learning worlds", async ({ page }) => {
    const worlds = page.locator("#worlds")
    for (const title of WORLDS) {
      await expect(worlds.getByText(title, { exact: true })).toBeVisible()
    }
    await expect(worlds.getByRole("listitem")).toHaveCount(6)
  })

  test("covers how it works, daily learning, safety and the parent value proposition", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Up and learning in three steps" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "A little every day goes a long way" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Built with care for young learners" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Know what your child is learning" })).toBeVisible()
    await expect(page.getByRole("contentinfo")).toContainText("Learn AI. Play Smart. Think Critically.")
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Privacy notice" })).toBeVisible()
  })

  test("makes no unsupported certification or accreditation claims", async ({ page }) => {
    const text = (await page.locator("body").innerText()).toLowerCase()
    for (const claim of ["coppa compliant", "coppa-compliant", "gdpr compliant", "kidsafe", "award-winning", "ofsted", "teacher approved", "expert approved", "guaranteed"]) {
      expect(text, claim).not.toContain(claim)
    }
    // The only mention of certification or accreditation is the statement that there is none.
    const mentions = text.match(/[^.]*\b(certified|accredited|accreditation|certification)\b[^.]*\./g) ?? []
    expect(mentions).toHaveLength(1)
    expect(mentions[0]).toContain("has not been certified or accredited")
  })

  test("has no horizontal scrolling and no serious accessibility violations", async ({ page }) => {
    expect(await hasHorizontalOverflow(page)).toBe(false)
    await expectNoSeriousA11yViolations(page)
  })

  test("offers a skip link as the first keyboard stop", async ({ page }) => {
    await page.keyboard.press("Tab")
    const skip = page.getByRole("link", { name: "Skip to main content" })
    await expect(skip).toBeFocused()
    await expect(skip).toHaveAttribute("href", "#main-content")
  })

  test("the privacy notice is reachable and marked as a draft", async ({ page }) => {
    await page.getByRole("contentinfo").getByRole("link", { name: "Privacy notice" }).click()
    await expect(page.getByRole("heading", { level: 1, name: "Privacy notice" })).toBeVisible()
    await expect(page.getByText("Draft: not yet reviewed by a lawyer")).toBeVisible()
    await expectNoSeriousA11yViolations(page)
  })
})

test.describe("responsive navigation", () => {
  test("desktop shows the links inline; mobile uses a menu that traps and returns focus", async ({ page, isMobile }) => {
    await page.goto("/")
    const inlineNav = page.getByRole("navigation", { name: "Main" })
    const menuButton = page.getByRole("button", { name: "Open menu" })

    if (!isMobile) {
      await expect(inlineNav.getByRole("link", { name: "Learning worlds" })).toBeVisible()
      await expect(menuButton).toBeHidden()
      await expect(page.getByRole("banner").getByRole("link", { name: "Log in" })).toBeVisible()
      return
    }

    await expect(inlineNav).toBeHidden()
    await expect(menuButton).toBeVisible()

    await menuButton.click()
    const dialog = page.getByRole("dialog", { name: "Main menu" })
    await expect(dialog).toBeVisible()
    for (const label of ["Learning worlds", "How it works", "Safety", "For parents", "Log in", "Get started"]) {
      await expect(dialog.getByRole("link", { name: label })).toBeVisible()
    }
    await expectNoSeriousA11yViolations(page)

    // Escape closes the menu and focus goes back to the button that opened it.
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(menuButton).toBeFocused()

    // Choosing a link navigates and closes the menu.
    await menuButton.click()
    await dialog.getByRole("link", { name: "Log in" }).click()
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole("dialog")).toHaveCount(0)
  })
})
