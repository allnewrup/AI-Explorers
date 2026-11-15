import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { ChildDashboardView } from "@/components/dashboards/child-dashboard-view"
import { ParentReportView } from "@/components/dashboards/parent-report-view"
import { EmptyState } from "@/components/feedback/empty-state"
import { SetupRequired } from "@/components/feedback/setup-required"
import { LeaderboardList } from "@/components/gamification/leaderboard-list"
import { LessonActions } from "@/components/lessons/lesson-actions"
import { LessonMediaPanel } from "@/components/lessons/lesson-media"
import { LessonView } from "@/components/lessons/lesson-view"
import { DailyChallengePlayer } from "@/components/quizzes/daily-challenge"
import { QuizReview } from "@/components/quizzes/quiz-review"
import { Progress } from "@/components/ui/progress"
import {
  emptyDashboard,
  emptyReport,
  sampleAttempt,
  sampleChallenge,
  sampleChild,
  sampleDashboard,
  sampleLeaderboard,
  sampleLesson,
  sampleQuizKey,
  sampleReport,
  sampleSibling,
} from "@/app/design-preview/fixtures"

// These components are rendered outside a Next.js router in tests.
vi.mock("@/features/lessons/actions", () => ({
  recordLessonProgressAction: vi.fn(async () => ({ ok: true, data: undefined })),
  completeLessonAction: vi.fn(),
}))
vi.mock("@/features/gamification/actions", () => ({ submitDailyChallengeAction: vi.fn() }))

describe("lesson media", () => {
  it("shows a clearly labelled pending state, and no player, when there is no video", () => {
    const { container } = render(<LessonMediaPanel media={{ state: "pending" }} title="What Is AI?" />)
    expect(screen.getByText("Video coming soon")).toBeInTheDocument()
    expect(container.querySelector("video")).toBeNull()
    expect(container.querySelector("iframe")).toBeNull()
  })

  it("says the video is unavailable when storage cannot serve it", () => {
    const { container } = render(<LessonMediaPanel media={{ state: "unavailable" }} title="What Is AI?" />)
    expect(screen.getByText("The video cannot be played right now")).toBeInTheDocument()
    expect(container.querySelector("video")).toBeNull()
  })

  it("renders a real player with a captions track only for a real asset", () => {
    const { container } = render(
      <LessonMediaPanel
        media={{ state: "ready", videoUrl: "https://storage.example/v.mp4?token=x", captionsUrl: "https://storage.example/c.vtt?token=x" }}
        title="What Is AI?"
      />
    )
    const video = container.querySelector("video")
    expect(video).not.toBeNull()
    expect(video).toHaveAttribute("controls")
    expect(video).not.toHaveAttribute("autoplay")
    const track = container.querySelector("track")
    expect(track).toHaveAttribute("kind", "captions")
    expect(track).toHaveAttribute("srclang", "en")
    expect(screen.getByText(/Captions are available/)).toBeInTheDocument()
  })

  it("tells the viewer when a video has no captions yet", () => {
    const { container } = render(
      <LessonMediaPanel media={{ state: "ready", videoUrl: "https://storage.example/v.mp4", captionsUrl: null }} title="x" />
    )
    expect(container.querySelector("track")).toBeNull()
    expect(screen.getByText(/no captions yet/)).toBeInTheDocument()
  })
})

describe("lesson view", () => {
  it("presents every part of a lesson, in order, with the sample label", () => {
    render(<LessonView lesson={sampleLesson} media={{ state: "pending" }} trackProgress={false} />)

    expect(screen.getByRole("heading", { level: 1, name: sampleLesson.title })).toBeInTheDocument()
    expect(screen.getByText("Sample lesson")).toBeInTheDocument()

    const headings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)
    expect(headings).toEqual([
      "What you will learn",
      "Read the lesson",
      "Key words",
      "What AI is good at",
      "Where AI falls short",
      "Stay safe",
      "Remember this",
    ])
    for (const objective of sampleLesson.learningObjectives) expect(screen.getByText(objective)).toBeInTheDocument()
    for (const note of sampleLesson.safetyNotes) expect(screen.getByText(note)).toBeInTheDocument()
    expect(screen.getByText(sampleLesson.keyTerms[0]!.term)).toBeInTheDocument()
  })

  it("omits sections that have no content instead of showing empty boxes", () => {
    render(
      <LessonView
        lesson={{ ...sampleLesson, keyTerms: [], advantages: [], limitations: [], keyTakeaways: [], isSample: false }}
        media={{ state: "pending" }}
        trackProgress={false}
      />
    )
    expect(screen.queryByRole("heading", { name: "Key words" })).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "What AI is good at" })).not.toBeInTheDocument()
    expect(screen.queryByText("Sample lesson")).not.toBeInTheDocument()
  })
})

describe("lesson completion", () => {
  it("awards nothing itself: it shows the XP the server reports", async () => {
    const user = userEvent.setup()
    const complete = vi.fn(async () => ({
      ok: true as const,
      data: { points_awarded: 10, already_completed: false, total_xp: 10, new_achievements: [] },
    }))
    render(
      <LessonActions lessonId="lesson-1" quizHref="/quiz" hasQuiz questionCount={5} initiallyCompleted={false} complete={complete} />
    )

    expect(screen.getByText(/earn 10 XP/)).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "I finished this lesson" }))

    expect(complete).toHaveBeenCalledWith("lesson-1")
    expect(await screen.findByText("You have completed this lesson.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "I finished this lesson" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Take the quiz \(5 questions\)/ })).toHaveAttribute("href", "/quiz")
  })

  it("shows the reason when the server refuses", async () => {
    const user = userEvent.setup()
    render(
      <LessonActions
        lessonId="lesson-1"
        quizHref="/quiz"
        hasQuiz={false}
        questionCount={0}
        initiallyCompleted={false}
        complete={async () => ({ ok: false, error: "That lesson is not available right now." })}
      />
    )
    await user.click(screen.getByRole("button", { name: "I finished this lesson" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("That lesson is not available right now.")
    expect(screen.getByText("This lesson does not have a quiz yet.")).toBeInTheDocument()
  })
})

describe("daily challenge", () => {
  it("sends only the chosen option and then shows the server's verdict", async () => {
    const user = userEvent.setup()
    const question = sampleChallenge.question!
    const correctId = sampleQuizKey[question.id]!.correctOptionId
    const submit = vi.fn(async (optionId: string) => ({
      ok: true as const,
      data: {
        ...sampleChallenge,
        completed: true,
        result: {
          selected_option_id: optionId,
          is_correct: optionId === correctId,
          correct_option_id: correctId,
          explanation: "The pictures, words and numbers an AI learns from are called data.",
        },
        points_awarded: 15,
        total_xp: 15,
        new_achievements: [],
        already_completed: false,
      },
    }))
    render(<DailyChallengePlayer challenge={sampleChallenge} submit={submit} />)

    const button = screen.getByRole("button", { name: "Check my answer" })
    expect(button).toBeDisabled()
    await user.click(screen.getByRole("radio", { name: /Data/ }))
    await user.click(button)

    expect(submit).toHaveBeenCalledWith(correctId)
    expect(await screen.findByText("Correct! Well done.")).toBeInTheDocument()
    expect(screen.getByText(/You earned 15 XP/)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Check my answer" })).not.toBeInTheDocument()
  })

  it("explains when there is no challenge instead of inventing one", () => {
    render(
      <DailyChallengePlayer challenge={{ ...sampleChallenge, available: false, question: null }} submit={vi.fn()} />
    )
    expect(screen.getByText("No challenge today")).toBeInTheDocument()
  })
})

describe("child dashboard", () => {
  it("shows the child's real numbers and next lesson", () => {
    render(<ChildDashboardView data={sampleDashboard} />)

    expect(screen.getByRole("heading", { level: 1, name: "Hi, CosmicOtter42!" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Today's lesson" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Continue learning" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "How Does Google Maps Use AI?" })).toBeInTheDocument()
    // Today's lesson is already in progress, and a second lesson was opened more recently.
    expect(screen.getAllByRole("link", { name: /Continue lesson/ }).map((link) => link.getAttribute("href"))).toEqual([
      "/child/lessons/how-does-google-maps-use-ai",
      "/child/lessons/what-is-a-deepfake",
    ])
    expect(screen.getByText("Pattern Finder")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Take the challenge" })).toHaveAttribute("href", "/child/challenge")
    expect(screen.getAllByText("Sample lesson").length).toBeGreaterThan(0)
  })

  it("welcomes a brand-new explorer with empty states, not made-up progress", () => {
    render(<ChildDashboardView data={emptyDashboard} />)

    expect(screen.getByText("Welcome aboard! Ready for your first mission?")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Start lesson/ })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Continue learning" })).not.toBeInTheDocument()
    expect(screen.getByText("Nobody has earned XP yet this week")).toBeInTheDocument()
    expect(screen.getByText("No streak yet")).toBeInTheDocument()
    expect(screen.getByText(/First Steps/)).toBeInTheDocument()
    expect(screen.getByText(/\(locked\)/)).toBeInTheDocument()
  })

  it("has a clear message when no lessons are published", () => {
    render(
      <ChildDashboardView data={{ ...emptyDashboard, todaysLesson: null, hasLessons: false, worlds: [] }} />
    )
    expect(screen.getByText("No lessons yet")).toBeInTheDocument()
    expect(screen.getByText("No worlds to explore yet")).toBeInTheDocument()
  })
})

describe("parent dashboard", () => {
  it("shows completed lessons, quiz attempts, accuracy, points, history and category progress", () => {
    render(
      <ParentReportView
        parentName="Sam"
        childProfiles={[sampleChild, sampleSibling]}
        selected={sampleChild}
        report={sampleReport}
      />
    )

    const totals = screen.getByRole("region", { name: "Totals" })
    expect(within(totals).getByText("Lessons completed").parentElement).toHaveTextContent("3")
    expect(within(totals).getByText("Quiz attempts").parentElement).toHaveTextContent("4")
    expect(within(totals).getByText("Accuracy").parentElement).toHaveTextContent("80%")
    expect(within(totals).getByText("16 of 20 answers correct")).toBeInTheDocument()
    expect(within(totals).getByText("Points earned").parentElement).toHaveTextContent("165 XP")

    expect(screen.getByRole("heading", { name: "This week" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Progress by learning world" })).toBeInTheDocument()
    expect(screen.getByRole("progressbar", { name: "AI Beginners: lessons completed" })).toHaveAttribute(
      "aria-valuenow",
      "2"
    )
    const history = screen.getByRole("heading", { name: "Learning history" }).closest("section")!
    expect(within(history).getAllByRole("listitem")).toHaveLength(4)

    // Switching child is a link; it selects nothing by itself.
    expect(screen.getByRole("link", { name: /BravePanda17/ })).toHaveAttribute(
      "href",
      `/parent?child=${sampleSibling.id}`
    )
  })

  it("with no activity, says so and shows no accuracy rather than 0%", () => {
    render(
      <ParentReportView parentName="Sam" childProfiles={[sampleSibling]} selected={sampleSibling} report={emptyReport} />
    )

    expect(screen.getByText("BravePanda17 has not started yet")).toBeInTheDocument()
    expect(screen.getByText(/Nothing on this page is estimated/)).toBeInTheDocument()
    expect(screen.getByText("No quiz answers yet")).toBeInTheDocument()
    expect(screen.queryByText("0%")).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Learning history" })).not.toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "Choose an explorer" })).not.toBeInTheDocument()
  })
})

describe("quiz review", () => {
  it("lists each answer with the stored question and correct answer", () => {
    render(<QuizReview attempt={sampleAttempt} lessonTitle="What Is Artificial Intelligence?" />)

    expect(screen.getByText("4 out of 5")).toBeInTheDocument()
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(5)
    expect(within(items[3]!).getByText(/Incorrect/)).toBeInTheDocument()
    expect(within(items[3]!).getByText("Correct answer:")).toBeInTheDocument()
    expect(within(items[0]!).queryByText("Correct answer:")).not.toBeInTheDocument()
  })
})

describe("shared states and primitives", () => {
  it("leaderboard marks the viewer and exposes nothing but name, avatar and XP", () => {
    const { container } = render(<LeaderboardList entries={sampleLeaderboard.entries} />)
    const rows = screen.getAllByRole("listitem")
    expect(rows).toHaveLength(4)
    expect(within(rows[2]!).getByText("(you)")).toBeInTheDocument()
    expect(within(rows[0]!).getByText("SwiftFalcon21")).toBeInTheDocument()
    expect(container.innerHTML).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/)
  })

  it("empty state shows a title, an explanation and an action", () => {
    render(<EmptyState title="No XP yet" description="Finish a lesson." action={<button type="button">Find a lesson</button>} />)
    expect(screen.getByText("No XP yet")).toBeInTheDocument()
    expect(screen.getByText("Finish a lesson.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Find a lesson" })).toBeInTheDocument()
  })

  it("setup screen states plainly that nothing is simulated", () => {
    render(<SetupRequired area="The explorer area" />)
    expect(screen.getByRole("heading", { name: "Supabase is not configured" })).toBeInTheDocument()
    expect(screen.getByText(/Nothing here is\s+simulated/)).toBeInTheDocument()
  })

  it("progress bar is labelled and clamps its value", () => {
    render(<Progress value={7} max={5} label="World progress" />)
    const bar = screen.getByRole("progressbar", { name: "World progress" })
    expect(bar).toHaveAttribute("aria-valuenow", "5")
    expect(bar).toHaveAttribute("aria-valuetext", "100%")
  })
})
