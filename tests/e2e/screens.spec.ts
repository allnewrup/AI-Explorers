import { expect, test } from "@playwright/test"
import { expectNoSeriousA11yViolations, hasHorizontalOverflow } from "./helpers/a11y"

/**
 * Signed-in screens, rendered through the design preview with invented sample
 * data (enabled only in the test build). This checks layout, responsiveness,
 * keyboard use and accessibility of the real components. It does NOT prove
 * that data flows from a database: that is covered by the database tests and,
 * with a real project, by tests/e2e/live.
 */

const preview = (screen: string) => `/design-preview/${screen}`

test.describe("child dashboard", () => {
  test("shows greeting, mascot, today's lesson, XP, level, streak, challenge, quiz, worlds, badges and leaders", async ({ page }) => {
    await page.goto(preview("child-dashboard"))

    await expect(page.getByRole("heading", { level: 1, name: "Hi, CosmicOtter42!" })).toBeVisible()
    await expect(page.getByRole("img", { name: "Spark the robot" })).toBeVisible()
    for (const heading of ["Today's lesson", "Continue learning", "Learning worlds", "Badges", "This week's leaders"]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible()
    }
    const greeting = page.getByRole("region", { name: "Hi, CosmicOtter42!" })
    await expect(greeting.getByText("XP", { exact: true })).toBeVisible()
    await expect(greeting.getByText("Level", { exact: true })).toBeVisible()
    await expect(greeting.getByText("Streak", { exact: true })).toBeVisible()
    await expect(page.getByText("Daily challenge").first()).toBeVisible()
    await expect(page.getByText("Quiz preview")).toBeVisible()
    await expect(page.getByText("Pattern Finder").first()).toBeVisible()
  })

  test("uses a bottom tab bar on phones and a top bar on desktop", async ({ page, isMobile }) => {
    await page.goto(preview("child-dashboard"))
    const navs = page.getByRole("navigation", { name: "Explorer" })

    if (isMobile) {
      await expect(navs).toHaveCount(1)
      const box = await navs.boundingBox()
      const viewport = page.viewportSize()!
      expect(box!.y + box!.height).toBeGreaterThan(viewport.height - 4)
      for (const label of ["Home", "Learn", "Challenge", "Progress", "Leaders"]) {
        const link = navs.getByRole("link", { name: label })
        await expect(link).toBeVisible()
        const size = await link.boundingBox()
        // Comfortable touch targets for small hands.
        expect(size!.height).toBeGreaterThanOrEqual(44)
        expect(size!.width).toBeGreaterThanOrEqual(44)
      }
    } else {
      await expect(navs.first().getByRole("link", { name: "Learn" })).toBeVisible()
    }
    await expect(navs.first().getByRole("link", { name: "Home" })).toHaveAttribute("href", "/child")
  })

  test("a brand-new explorer sees helpful empty states", async ({ page }) => {
    await page.goto(preview("child-dashboard-new"))
    await expect(page.getByText("Welcome aboard! Ready for your first mission?")).toBeVisible()
    await expect(page.getByText("Nobody has earned XP yet this week")).toBeVisible()
    await expect(page.getByText("No streak yet")).toBeVisible()
  })
})

test.describe("lesson page", () => {
  test("shows every lesson section and a media-pending state instead of a fake video", async ({ page }) => {
    await page.goto(preview("lesson"))

    await expect(page.getByRole("heading", { level: 1, name: "What Is Artificial Intelligence?" })).toBeVisible()
    await expect(page.getByText("Sample lesson")).toBeVisible()
    for (const heading of ["What you will learn", "Read the lesson", "Key words", "What AI is good at", "Where AI falls short", "Stay safe", "Remember this"]) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible()
    }

    await expect(page.getByTestId("media-pending")).toContainText("Video coming soon")
    await expect(page.locator("video, iframe, audio")).toHaveCount(0)

    await expect(page.getByRole("link", { name: /Take the quiz \(5 questions\)/ })).toBeVisible()
  })

  test("marks the lesson complete and reports the XP", async ({ page }) => {
    await page.goto(preview("lesson"))
    await page.getByRole("button", { name: "I finished this lesson" }).click()
    await expect(page.getByText("You have completed this lesson.")).toBeVisible()
    await expect(page.getByText("Lesson complete! +10 XP")).toBeVisible()
    await expect(page.getByRole("button", { name: "I finished this lesson" })).toHaveCount(0)
  })
})

test.describe("quiz", () => {
  test("can be completed with the keyboard alone, with feedback after every answer", async ({ page }) => {
    await page.goto(preview("quiz"))

    await expect(page.getByText("5 questions")).toBeVisible()
    await page.getByRole("button", { name: "Start the quiz" }).click()

    for (let index = 1; index <= 5; index += 1) {
      await expect(page.getByText(`Question ${index} of 5`)).toBeVisible()
      const group = page.getByRole("group")
      // Focus was moved to the question for keyboard and screen-reader users.
      await expect(group.locator("legend")).toBeFocused()

      const check = page.getByRole("button", { name: "Check my answer" })
      await expect(check).toBeDisabled()

      // Tab into the radio group, move with an arrow key, then submit.
      await page.keyboard.press("Tab")
      await page.keyboard.press("ArrowDown")
      await expect(group.getByRole("radio").nth(1)).toBeChecked()
      await expect(check).toBeEnabled()
      await check.press("Enter")

      const feedback = page.getByRole("status").filter({ hasText: /Correct! Well done\.|Not quite\. Good try!/ })
      await expect(feedback).toBeVisible()
      await expect(page.getByText("Correct answer", { exact: true })).toBeVisible()
      for (const radio of await group.getByRole("radio").all()) await expect(radio).toBeDisabled()

      await page.getByRole("button", { name: index === 5 ? "See my results" : "Next question" }).click()
    }

    await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
    await expect(page.getByText(/out of 5/)).toBeVisible()
    await expect(page.getByText(/XP earned|No new XP this time/)).toBeVisible()
    await expect(page.getByRole("link", { name: "Review my answers" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible()
  })

  test("the page source never contains the answer key before answering", async ({ page }) => {
    await page.goto(preview("quiz"))
    await page.getByRole("button", { name: "Start the quiz" }).click()
    await expect(page.getByText("Question 1 of 5")).toBeVisible()

    const dom = await page.locator("main").innerHTML()
    expect(dom).not.toMatch(/is_correct|correct_option|Correct answer/)
    await expect(page.getByText("AI is a kind of computer program. It can do some tasks")).toHaveCount(0)
  })

  test("review lists each stored answer", async ({ page }) => {
    await page.goto(preview("quiz-review"))
    await expect(page.getByText("4 out of 5")).toBeVisible()
    await expect(page.locator("main ol > li")).toHaveCount(5)
    await expect(page.getByText("Correct answer:")).toHaveCount(1)
  })
})

test("daily challenge gives feedback and locks after one answer", async ({ page }) => {
  await page.goto(preview("challenge"))
  const check = page.getByRole("button", { name: "Check my answer" })
  await expect(check).toBeDisabled()
  // Click the answer card, as a child would.
  await page.getByRole("group").getByText("Data", { exact: true }).click()
  await expect(page.getByRole("radio", { name: /Data/ })).toBeChecked()
  await check.click()
  await expect(page.getByText("Correct! Well done.")).toBeVisible()
  await expect(page.getByText(/Come back tomorrow for a new question/)).toBeVisible()
  await expect(page.getByRole("button", { name: "Check my answer" })).toHaveCount(0)
})

test.describe("parent dashboard", () => {
  test("shows the child, totals, weekly summary, category progress and history", async ({ page }) => {
    await page.goto(preview("parent"))
    await expect(page.getByRole("heading", { level: 2, name: "CosmicOtter42" })).toBeVisible()
    const totals = page.getByRole("region", { name: "Totals" })
    for (const label of ["Lessons completed", "Quiz attempts", "Accuracy", "Points earned"]) {
      await expect(totals.getByText(label)).toBeVisible()
    }
    await expect(totals.getByText("80%")).toBeVisible()
    for (const heading of ["This week", "Progress by learning world", "Learning history"]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible()
    }
    await expect(page.getByRole("progressbar")).toHaveCount(6)
  })

  test("with no activity it says so instead of showing invented numbers", async ({ page }) => {
    await page.goto(preview("parent-new"))
    await expect(page.getByText("BravePanda17 has not started yet")).toBeVisible()
    await expect(page.getByText("No quiz answers yet")).toBeVisible()
    await expect(page.getByText("0%")).toHaveCount(0)
    await expect(page.getByRole("heading", { name: "Learning history" })).toHaveCount(0)
  })
})

test("admin lesson editor exposes every content field and the quiz editor", async ({ page }) => {
  await page.goto(preview("admin-editor"))
  for (const label of ["Title", "URL name", "Learning world", "Age group", "Description", "Lesson text / transcript", "Video file path", "Captions file path (.vtt)", "Quiz title"]) {
    await expect(page.getByLabel(label, { exact: true })).toBeVisible()
  }
  for (const legend of ["Learning objectives", "Advantages", "Limitations", "Safety notes"]) {
    await expect(page.getByRole("group", { name: legend })).toBeVisible()
  }
  await expect(page.getByRole("button", { name: "Save draft" }).first()).toBeVisible()
  await expect(page.getByRole("button", { name: "Save and publish" })).toBeVisible()

  // Adding a question gives it four choices with exactly one marked correct.
  await page.getByRole("button", { name: "Add question" }).click()
  const added = page.getByRole("listitem").filter({ hasText: "Question 3" })
  await expect(added.getByRole("radio")).toHaveCount(4)
  await expect(added.getByRole("radio", { checked: true })).toHaveCount(1)
})

test.describe("every signed-in screen", () => {
  const SCREENS = [
    "child-dashboard",
    "child-dashboard-new",
    "learn",
    "world",
    "lesson",
    "quiz",
    "quiz-review",
    "challenge",
    "progress",
    "leaderboard",
    "parent",
    "parent-new",
    "admin-editor",
    "states",
    "setup-required",
  ]

  for (const screen of SCREENS) {
    test(`${screen}: fits the viewport and has no serious accessibility violations`, async ({ page }) => {
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))

      await page.goto(preview(screen))
      await expect(page.getByText("Design preview. Invented sample data")).toBeVisible()
      await expect(page.locator("#main-content")).toBeVisible()

      expect(await hasHorizontalOverflow(page), "horizontal overflow").toBe(false)
      await expectNoSeriousA11yViolations(page)
      expect(errors, "uncaught page errors").toEqual([])
    })
  }
})

test("loading placeholders announce themselves to assistive technology", async ({ page }) => {
  await page.goto(preview("states"))
  const loading = page.getByRole("status").filter({ hasText: "Loading your dashboard" })
  await expect(loading).toHaveAttribute("aria-busy", "true")
})
