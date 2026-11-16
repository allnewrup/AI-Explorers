import { expect, test, type Page } from "@playwright/test"
import {
  createChildFor,
  createTestParent,
  deleteTestUser,
  serviceClient,
  signedInClient,
  type TestUser,
} from "./helpers"

/**
 * The whole product journey in a real browser against a real Supabase project.
 */

test.describe.configure({ mode: "serial" })

async function logIn(page: Page, user: TestUser) {
  await page.goto("/login")
  await page.getByLabel("Email address").fill(user.email)
  await page.getByLabel("Password").fill(user.password)
  await page.getByRole("button", { name: "Log in" }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

test.describe("live journey", () => {
  let parent: TestUser
  let otherParent: TestUser
  let attemptUrl = ""

  test.beforeAll(async () => {
    parent = await createTestParent("journey")
    otherParent = await createTestParent("journey-other")
  })

  test.afterAll(async () => {
    await deleteTestUser(parent)
    await deleteTestUser(otherParent)
  })

  test("a parent logs in, creates an explorer and reaches the child dashboard", async ({ page }) => {
    await logIn(page, parent)
    await expect(page).toHaveURL(/\/parent$/)
    await page.getByRole("link", { name: /Set up an explorer/ }).click()

    await expect(page).toHaveURL(/\/onboarding$/)
    // An explorer name is pre-selected; tick the two required consents.
    await page.getByRole("checkbox", { name: /parent or legal guardian/ }).check()
    await page.getByRole("checkbox", { name: /may store this child's explorer name/ }).check()
    await page.getByRole("button", { name: "Create explorer profile" }).click()

    await expect(page).toHaveURL(/\/child$/)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hi, ")
    await expect(page.getByRole("heading", { name: "Today's lesson" })).toBeVisible()
  })

  test("the child sees six worlds, opens a sample lesson, completes it and takes the quiz", async ({ page }) => {
    await logIn(page, parent)
    await page.goto("/child/learn")
    await expect(page.getByRole("main").getByRole("listitem")).toHaveCount(6)

    await page.getByRole("link", { name: /AI Beginners/ }).click()
    await page.getByRole("link", { name: /What Is Artificial Intelligence\?/ }).click()

    await expect(page.getByRole("heading", { level: 1, name: "What Is Artificial Intelligence?" })).toBeVisible()
    await expect(page.getByRole("article").getByText("Sample lesson")).toBeVisible()
    await expect(page.getByTestId("media-pending")).toBeVisible()
    await expect(page.locator("video")).toHaveCount(0)

    await page.getByRole("button", { name: "I finished this lesson" }).click()
    await expect(page.getByText("You have completed this lesson.")).toBeVisible()

    await page.getByRole("link", { name: /Take the quiz/ }).click()
    await page.getByRole("button", { name: "Start the quiz" }).click()
    for (let index = 1; index <= 5; index += 1) {
      await expect(page.getByText(`Question ${index} of 5`)).toBeVisible()
      await page.getByRole("group").locator("label").first().click()
      await page.getByRole("button", { name: "Check my answer" }).click()
      await expect(page.getByText("Correct answer", { exact: true })).toBeVisible()
      await page.getByRole("button", { name: index === 5 ? "See my results" : "Next question" }).click()
    }
    await expect(page.getByText(/out of 5/)).toBeVisible()
    await expect(page.getByText(/XP earned/)).toBeVisible()

    await page.getByRole("link", { name: "Review my answers" }).click()
    await expect(page).toHaveURL(/\/quiz\/results\//)
    await expect(page.locator("main ol > li")).toHaveCount(5)
    attemptUrl = new URL(page.url()).pathname
  })

  test("the parent dashboard shows the stored results", async ({ page }) => {
    await logIn(page, parent)
    await page.goto("/parent")
    const totals = page.getByRole("region", { name: "Totals" })
    await expect(totals.getByText("Lessons completed").locator("..")).toContainText("1")
    await expect(totals.getByText("Quiz attempts").locator("..")).toContainText("1")
    await expect(totals.getByText(/of 5 answers correct/)).toBeVisible()
    await expect(page.getByRole("heading", { name: "Learning history" })).toBeVisible()

    // The numbers on screen equal what the database holds.
    const client = await signedInClient(parent.email, parent.password)
    const children = await client.from("child_profiles").select("id")
    const summary = await client.rpc("get_child_summary", { p_child_id: children.data?.[0]?.id })
    const { total_xp } = summary.data as { total_xp: number }
    expect(total_xp).toBeGreaterThanOrEqual(15)
    await expect(totals.getByText(`${total_xp} XP`)).toBeVisible()
  })

  test("another family cannot open this child's quiz results or dashboard", async ({ page }) => {
    const other = await signedInClient(otherParent.email, otherParent.password)
    await createChildFor(other, "BravePanda17")

    await logIn(page, otherParent)
    const response = await page.goto(attemptUrl)
    await expect(page.getByRole("heading", { name: "We could not find that page" })).toBeVisible()
    expect(response?.status()).toBeLessThan(500)

    const firstParent = await signedInClient(parent.email, parent.password)
    const children = await firstParent.from("child_profiles").select("id")
    await page.goto(`/parent?child=${children.data?.[0]?.id}`)
    await expect(page.getByRole("heading", { level: 2, name: "BravePanda17" })).toBeVisible()
    await expect(page.getByText("BravePanda17 has not started yet")).toBeVisible()
  })

  test("a parent gets 'not found' for the admin area; an administrator can open it", async ({ page }) => {
    await logIn(page, parent)
    await page.goto("/admin")
    await expect(page.getByRole("heading", { name: "We could not find that page" })).toBeVisible()
    await expect(page.getByText("Content overview")).toHaveCount(0)

    // Appoint an administrator the supported way: from a trusted environment.
    await serviceClient().from("profiles").update({ role: "admin" }).eq("id", otherParent.id)

    await page.context().clearCookies()
    await logIn(page, otherParent)
    await page.goto("/admin/lessons")
    await expect(page.getByRole("heading", { level: 1, name: "Lessons" })).toBeVisible()
    await expect(page.getByRole("row")).not.toHaveCount(0)
  })
})
