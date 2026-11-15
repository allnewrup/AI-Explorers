import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { QuizPlayer, type QuizActions } from "@/components/quizzes/quiz-player"
import type { QuizForPlay } from "@/features/lessons/queries"
import type { AnswerFeedback, QuizResult } from "@/features/quizzes/schemas"

const quiz: QuizForPlay = {
  id: "00000000-0000-4000-8000-000000000001",
  title: "Quiz",
  instructions: "Two quick questions.",
  passingScore: 50,
  questions: [
    {
      id: "00000000-0000-4000-8000-0000000000a1",
      text: "What do we call the examples an AI learns from?",
      options: [
        { id: "00000000-0000-4000-8000-0000000000b1", text: "Batteries" },
        { id: "00000000-0000-4000-8000-0000000000b2", text: "Data" },
      ],
    },
    {
      id: "00000000-0000-4000-8000-0000000000a2",
      text: "Is AI alive?",
      options: [
        { id: "00000000-0000-4000-8000-0000000000c1", text: "No" },
        { id: "00000000-0000-4000-8000-0000000000c2", text: "Yes" },
      ],
    },
  ],
}

const ATTEMPT = "00000000-0000-4000-8000-00000000000f"
/** The "server's" answer key. The component under test never receives it. */
const KEY: Record<string, string> = {
  [quiz.questions[0]!.id]: quiz.questions[0]!.options[1]!.id,
  [quiz.questions[1]!.id]: quiz.questions[1]!.options[0]!.id,
}

function feedbackFor(questionId: string, optionId: string): AnswerFeedback {
  return {
    question_id: questionId,
    selected_option_id: optionId,
    is_correct: KEY[questionId] === optionId,
    correct_option_id: KEY[questionId] ?? null,
    explanation: `Explanation for ${questionId.slice(-2)}`,
    already_answered: false,
  }
}

function makeActions(overrides: Partial<QuizActions> = {}) {
  const result: QuizResult = {
    attempt_id: ATTEMPT,
    score: 50,
    total_questions: 2,
    correct_answers: 1,
    passing_score: 50,
    passed: true,
    points_awarded: 15,
    total_xp: 15,
    new_achievements: [
      { id: "00000000-0000-4000-8000-0000000000d1", title: "First Steps", description: "Earn 10 XP.", badge_key: "first-steps" },
    ],
    already_completed: false,
  }
  return {
    start: vi.fn<QuizActions["start"]>(async () => ({ ok: true, data: { attempt_id: ATTEMPT, answered: [] } })),
    answer: vi.fn<QuizActions["answer"]>(async ({ questionId, optionId }) => ({
      ok: true,
      data: feedbackFor(questionId, optionId),
    })),
    complete: vi.fn<QuizActions["complete"]>(async () => ({ ok: true, data: result })),
    ...overrides,
  }
}

function renderQuiz(actions: QuizActions) {
  return render(
    <QuizPlayer quiz={quiz} lessonTitle="What Is AI?" lessonSlug="what-is-ai" actions={actions} />
  )
}

describe("QuizPlayer", () => {
  it("shows an introduction and does not contact the server until the child starts", () => {
    const actions = makeActions()
    renderQuiz(actions)

    expect(screen.getByRole("heading", { name: "What Is AI?" })).toBeInTheDocument()
    expect(screen.getByText("2 questions")).toBeInTheDocument()
    expect(screen.getByText("Up to 25 XP")).toBeInTheDocument()
    expect(actions.start).not.toHaveBeenCalled()
  })

  it("plays a whole quiz: answers are judged by the server and the result comes back from it", async () => {
    const user = userEvent.setup()
    const actions = makeActions()
    renderQuiz(actions)

    await user.click(screen.getByRole("button", { name: "Start the quiz" }))
    expect(actions.start).toHaveBeenCalledWith(quiz.id)

    // Question 1: nothing is marked right or wrong before the server replies.
    const group = await screen.findByRole("group", { name: quiz.questions[0]!.text })
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument()
    expect(within(group).queryByText("Correct answer")).not.toBeInTheDocument()

    const check = screen.getByRole("button", { name: "Check my answer" })
    expect(check).toBeDisabled()

    await user.click(within(group).getByRole("radio", { name: /Batteries/ }))
    expect(check).toBeEnabled()
    await user.click(check)

    // Only ids are sent: no score, no "is correct" flag.
    expect(actions.answer).toHaveBeenCalledWith({
      attemptId: ATTEMPT,
      questionId: quiz.questions[0]!.id,
      optionId: quiz.questions[0]!.options[0]!.id,
    })

    expect(await screen.findByText("Not quite. Good try!")).toBeInTheDocument()
    expect(screen.getByText("Explanation for a1")).toBeInTheDocument()
    expect(screen.getByText("Correct answer")).toBeInTheDocument()
    expect(screen.getByText("Your answer")).toBeInTheDocument()
    // The answer is locked once judged.
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled()

    await user.click(screen.getByRole("button", { name: "Next question" }))

    // Question 2
    const second = await screen.findByRole("group", { name: quiz.questions[1]!.text })
    await user.click(within(second).getByRole("radio", { name: /No/ }))
    await user.click(screen.getByRole("button", { name: "Check my answer" }))
    expect(await screen.findByText("Correct! Well done.")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "See my results" }))
    expect(actions.complete).toHaveBeenCalledWith(ATTEMPT)

    // Results are exactly what the server returned.
    expect(await screen.findByRole("heading", { name: "Brilliant work!" })).toBeInTheDocument()
    expect(screen.getByText("1 out of 2")).toBeInTheDocument()
    expect(screen.getByText("+15 XP earned")).toBeInTheDocument()
    expect(screen.getByText("New badge: First Steps")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Review my answers" })).toHaveAttribute(
      "href",
      `/child/lessons/what-is-ai/quiz/results/${ATTEMPT}`
    )
    expect(actions.answer).toHaveBeenCalledTimes(2)
    expect(actions.complete).toHaveBeenCalledTimes(1)
  })

  it("resumes an unfinished attempt at the first unanswered question", async () => {
    const user = userEvent.setup()
    const first = quiz.questions[0]!
    const actions = makeActions({
      start: vi.fn(async () => ({
        ok: true as const,
        data: { attempt_id: ATTEMPT, answered: [feedbackFor(first.id, first.options[1]!.id)] },
      })),
    })
    renderQuiz(actions)

    await user.click(screen.getByRole("button", { name: "Start the quiz" }))
    expect(await screen.findByText("Question 2 of 2")).toBeInTheDocument()
    expect(screen.getByRole("group", { name: quiz.questions[1]!.text })).toBeInTheDocument()
  })

  it("shows the server's message when an answer is rejected, and lets the child retry", async () => {
    const user = userEvent.setup()
    const answer = vi
      .fn<QuizActions["answer"]>()
      .mockResolvedValueOnce({ ok: false, error: "This explorer profile is paused. A parent can switch it back on." })
      .mockImplementation(async ({ questionId, optionId }) => ({ ok: true, data: feedbackFor(questionId, optionId) }))
    renderQuiz(makeActions({ answer }))

    await user.click(screen.getByRole("button", { name: "Start the quiz" }))
    await user.click(await screen.findByRole("radio", { name: /Data/ }))
    await user.click(screen.getByRole("button", { name: "Check my answer" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("This explorer profile is paused")
    expect(screen.queryByText("Correct! Well done.")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Check my answer" }))
    expect(await screen.findByText("Correct! Well done.")).toBeInTheDocument()
  })

  it("stays on the introduction with an explanation when the quiz cannot be started", async () => {
    const user = userEvent.setup()
    const actions = makeActions({
      start: vi.fn(async () => ({ ok: false as const, error: "That quiz is not available right now." })),
    })
    renderQuiz(actions)

    await user.click(screen.getByRole("button", { name: "Start the quiz" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("That quiz is not available right now.")
    expect(screen.getByRole("button", { name: "Start the quiz" })).toBeEnabled()
  })

  it("reports a network failure instead of hanging", async () => {
    const user = userEvent.setup()
    renderQuiz(makeActions({ start: vi.fn(async () => Promise.reject(new Error("offline"))) }))

    await user.click(screen.getByRole("button", { name: "Start the quiz" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("could not reach the server")
  })

  it("says so honestly when a retake earns no new XP", async () => {
    const user = userEvent.setup()
    const actions = makeActions({
      start: vi.fn(async () => ({
        ok: true as const,
        data: {
          attempt_id: ATTEMPT,
          answered: quiz.questions.map((question) => feedbackFor(question.id, KEY[question.id]!)),
        },
      })),
      complete: vi.fn(async () => ({
        ok: true as const,
        data: {
          attempt_id: ATTEMPT,
          score: 100,
          total_questions: 2,
          correct_answers: 2,
          passing_score: 50,
          passed: true,
          points_awarded: 0,
          total_xp: 25,
          new_achievements: [],
          already_completed: false,
        },
      })),
    })
    renderQuiz(actions)

    await user.click(screen.getByRole("button", { name: "Start the quiz" }))
    expect(await screen.findByText("No new XP this time")).toBeInTheDocument()
    expect(screen.getByText(/already collected the XP/)).toBeInTheDocument()
  })

  it("moves keyboard focus to each new question", async () => {
    const user = userEvent.setup()
    renderQuiz(makeActions())

    await user.click(screen.getByRole("button", { name: "Start the quiz" }))
    const group = await screen.findByRole("group", { name: quiz.questions[0]!.text })
    await waitFor(() => expect(within(group).getByText(quiz.questions[0]!.text)).toHaveFocus())
  })
})
