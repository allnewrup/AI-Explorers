"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, LoaderCircle, RefreshCw, Zap } from "lucide-react"
import { Spark } from "@/components/mascot/spark"
import { AnswerOptions } from "@/components/quizzes/answer-options"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { XP_RULES } from "@/config/gamification"
import { routes } from "@/config/site"
import type { QuizForPlay } from "@/features/lessons/queries"
import {
  answerQuestionAction,
  completeQuizAction,
  startQuizAction,
} from "@/features/quizzes/actions"
import type { AnswerFeedback, QuizResult, QuizStart } from "@/features/quizzes/schemas"
import type { ActionResult } from "@/lib/action-result"

export type QuizActions = {
  start: (quizId: string) => Promise<ActionResult<QuizStart>>
  answer: (input: {
    attemptId: string
    questionId: string
    optionId: string
  }) => Promise<ActionResult<AnswerFeedback>>
  complete: (attemptId: string) => Promise<ActionResult<QuizResult>>
}

const serverActions: QuizActions = {
  start: startQuizAction,
  answer: answerQuestionAction,
  complete: completeQuizAction,
}

type Phase =
  | { name: "intro" }
  | { name: "question"; index: number }
  | { name: "result"; result: QuizResult }

/**
 * Runs a quiz.
 *
 * What this component knows: the questions and the answer choices.
 * What it does not know until the server tells it: which choice is correct,
 * the explanation, the score and the XP. Each answer is sent to the server,
 * which judges it, stores it and replies with the verdict. A child who edits
 * this code in their browser can change what is drawn on their own screen,
 * and nothing else.
 */
export function QuizPlayer({
  quiz,
  lessonTitle,
  lessonSlug,
  actions = serverActions,
}: {
  quiz: QuizForPlay
  lessonTitle: string
  lessonSlug: string
  /** Injectable for tests. Defaults to the real server actions. */
  actions?: QuizActions
}) {
  const [phase, setPhase] = useState<Phase>({ name: "intro" })
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, AnswerFeedback>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const legendRef = useRef<HTMLLegendElement>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)

  const total = quiz.questions.length
  const questionIndex = phase.name === "question" ? phase.index : -1

  // Move focus to the new question (or the result) so keyboard and
  // screen-reader users are taken along with the visual change.
  useEffect(() => {
    if (phase.name === "question") legendRef.current?.focus()
    if (phase.name === "result") resultRef.current?.focus()
  }, [phase.name, questionIndex])

  async function run(task: () => Promise<void>) {
    setPending(true)
    setError(null)
    try {
      await task()
    } catch {
      setError("We could not reach the server. Check your connection and try again.")
    } finally {
      setPending(false)
    }
  }

  async function finish(id: string) {
    const result = await actions.complete(id)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setPhase({ name: "result", result: result.data })
  }

  function handleStart() {
    void run(async () => {
      const started = await actions.start(quiz.id)
      if (!started.ok) {
        setError(started.error)
        return
      }
      const known = new Set(quiz.questions.map((question) => question.id))
      const saved: Record<string, AnswerFeedback> = {}
      for (const item of started.data.answered) {
        if (known.has(item.question_id)) saved[item.question_id] = item
      }
      setAttemptId(started.data.attempt_id)
      setFeedback(saved)
      setSelected(null)

      const next = quiz.questions.findIndex((question) => !saved[question.id])
      if (next === -1) {
        await finish(started.data.attempt_id)
      } else {
        setPhase({ name: "question", index: next })
      }
    })
  }

  function handleCheck(questionId: string) {
    if (!attemptId || !selected) return
    void run(async () => {
      const result = await actions.answer({ attemptId, questionId, optionId: selected })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setFeedback((current) => ({ ...current, [questionId]: result.data }))
    })
  }

  function handleNext() {
    if (phase.name !== "question" || !attemptId) return
    const next = quiz.questions.findIndex(
      (question, index) => index > phase.index && !feedback[question.id]
    )
    setSelected(null)
    if (next === -1) {
      void run(() => finish(attemptId))
    } else {
      setPhase({ name: "question", index: next })
    }
  }

  function handleRetry() {
    setPhase({ name: "intro" })
    setAttemptId(null)
    setFeedback({})
    setSelected(null)
    setError(null)
  }

  const errorAlert = error ? (
    <Alert variant="destructive" role="alert">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  ) : null

  /* ------------------------------------------------------------ intro */
  if (phase.name === "intro") {
    const maxXp = XP_RULES.quizCompleted + total * XP_RULES.quizCorrectAnswer
    return (
      <div className="mx-auto grid max-w-2xl gap-6 rounded-4xl bg-white p-6 text-center shadow-card ring-1 ring-ink-900/5 sm:p-10">
        <Spark mood="wave" size={130} className="mx-auto" />
        <div>
          <p className="font-heading text-sm font-semibold tracking-widest text-electric-600 uppercase">
            Quiz time
          </p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">{lessonTitle}</h1>
          {quiz.instructions ? <p className="mt-3 text-lg text-ink-500">{quiz.instructions}</p> : null}
        </div>
        <ul className="mx-auto flex flex-wrap justify-center gap-3 text-sm font-bold text-ink-700">
          <li className="rounded-full bg-electric-100 px-4 py-2 text-electric-700">
            {total} {total === 1 ? "question" : "questions"}
          </li>
          <li className="rounded-full bg-sun-100 px-4 py-2 text-sun-700">Up to {maxXp} XP</li>
          <li className="rounded-full bg-aqua-100 px-4 py-2 text-aqua-700">No time limit</li>
        </ul>
        <p className="text-sm text-ink-500">
          Once you check an answer it is locked in, so take your time. You can retake the quiz as
          often as you like.
        </p>
        {errorAlert}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="xl" variant="playful" onClick={handleStart} disabled={pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
            {pending ? "Getting ready…" : "Start the quiz"}
          </Button>
          <Button asChild size="xl" variant="outline">
            <Link href={routes.child.lesson(lessonSlug)}>Back to the lesson</Link>
          </Button>
        </div>
      </div>
    )
  }

  /* ----------------------------------------------------------- result */
  if (phase.name === "result") {
    const { result } = phase
    return (
      <div className="mx-auto grid max-w-2xl gap-6 rounded-4xl bg-white p-6 text-center shadow-card ring-1 ring-ink-900/5 sm:p-10">
        <Spark mood={result.passed ? "celebrate" : "happy"} size={150} className="mx-auto" />
        <div>
          <h1 ref={resultRef} tabIndex={-1} className="text-3xl font-semibold outline-none sm:text-4xl">
            {result.passed ? "Brilliant work!" : "Good effort!"}
          </h1>
          <p className="mt-2 text-xl text-ink-700">
            You got{" "}
            <strong>
              {result.correct_answers} out of {result.total_questions}
            </strong>{" "}
            right ({result.score}%).
          </p>
          <p className="mt-1 text-ink-500">
            {result.passed
              ? "You have shown you understand this lesson."
              : "Have another read of the lesson and try again. Every go helps you learn."}
          </p>
        </div>

        <div className="mx-auto inline-flex items-center gap-2 rounded-2xl bg-sun-100 px-5 py-3 font-heading text-xl font-bold text-ink-900">
          <Zap className="size-5 fill-sun-500 text-sun-700" aria-hidden="true" />
          {result.points_awarded > 0
            ? `+${result.points_awarded} XP earned`
            : "No new XP this time"}
        </div>
        {result.points_awarded === 0 ? (
          <p className="-mt-3 text-sm text-ink-500">
            You have already collected the XP for the answers you got right.
          </p>
        ) : null}

        {result.new_achievements.length > 0 ? (
          <ul className="grid gap-2 text-left">
            {result.new_achievements.map((achievement) => (
              <li key={achievement.id} className="rounded-2xl bg-nebula-50 p-4 ring-1 ring-nebula-100">
                <p className="font-heading font-semibold text-nebula-700">
                  New badge: {achievement.title}
                </p>
                <p className="text-sm text-ink-600">{achievement.description}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg">
            <Link href={routes.child.quizResults(lessonSlug, result.attempt_id)}>
              Review my answers
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" onClick={handleRetry}>
            <RefreshCw aria-hidden="true" />
            Try again
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href={routes.child.learn}>More lessons</Link>
          </Button>
        </div>
      </div>
    )
  }

  /* --------------------------------------------------------- question */
  const question = quiz.questions[phase.index]
  if (!question) return null
  const verdict = feedback[question.id]
  const answeredCount = quiz.questions.filter((item) => feedback[item.id]).length
  const isLast = quiz.questions.every((item, index) => index <= phase.index || feedback[item.id])

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <div className="flex items-center justify-between font-heading font-semibold text-ink-700">
          <span>
            Question {phase.index + 1} of {total}
          </span>
          <span className="text-sm text-ink-500">{lessonTitle}</span>
        </div>
        <Progress value={answeredCount} max={total} label="Quiz progress" tone="electric" />
      </div>

      <div className="rounded-4xl bg-white p-5 shadow-card ring-1 ring-ink-900/5 sm:p-8">
        <AnswerOptions
          name={`question-${question.id}`}
          legend={question.text}
          options={question.options}
          value={selected}
          onChange={setSelected}
          legendRef={legendRef}
          disabled={pending}
          verdict={
            verdict
              ? {
                  selectedOptionId: verdict.selected_option_id,
                  correctOptionId: verdict.correct_option_id,
                }
              : null
          }
        />

        <div className="mt-6" role="status" aria-live="polite">
          {verdict ? (
            <div
              className={
                verdict.is_correct
                  ? "flex items-start gap-4 rounded-3xl bg-aqua-50 p-4 ring-1 ring-aqua-100"
                  : "flex items-start gap-4 rounded-3xl bg-sun-50 p-4 ring-1 ring-sun-100"
              }
            >
              <Spark mood={verdict.is_correct ? "celebrate" : "thinking"} size={72} />
              <div>
                <p className="font-heading text-xl font-semibold text-ink-900">
                  {verdict.is_correct ? "Correct! Well done." : "Not quite. Good try!"}
                </p>
                {verdict.explanation ? (
                  <p className="mt-1 text-ink-700">{verdict.explanation}</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {errorAlert ? <div className="mt-4">{errorAlert}</div> : null}

        <div className="mt-6 flex justify-end">
          {verdict ? (
            <Button size="lg" onClick={handleNext} disabled={pending}>
              {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {pending ? "Working out your score…" : isLast ? "See my results" : "Next question"}
              {pending ? null : <ArrowRight aria-hidden="true" />}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => handleCheck(question.id)}
              disabled={!selected || pending}
            >
              {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {pending ? "Checking…" : "Check my answer"}
            </Button>
          )}
        </div>
        {!verdict && !selected ? (
          <p className="mt-2 text-right text-sm text-ink-500">Choose an answer to continue.</p>
        ) : null}
      </div>
    </div>
  )
}
