"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarCheck, LoaderCircle, Zap } from "lucide-react"
import { toast } from "sonner"
import { Spark } from "@/components/mascot/spark"
import { AnswerOptions } from "@/components/quizzes/answer-options"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { submitDailyChallengeAction } from "@/features/gamification/actions"
import type { DailyChallenge, DailyChallengeSubmission } from "@/features/gamification/schemas"
import type { ActionResult } from "@/lib/action-result"

/**
 * Today's question. As with quizzes, the answer is judged by the server: the
 * question arrives without its answer key, and the verdict comes back only
 * after a choice has been submitted.
 */
export function DailyChallengePlayer({
  challenge: initial,
  submit = submitDailyChallengeAction,
}: {
  challenge: DailyChallenge
  /** Injectable for tests. */
  submit?: (optionId: string) => Promise<ActionResult<DailyChallengeSubmission>>
}) {
  const [challenge, setChallenge] = useState<DailyChallenge>(initial)
  const [selected, setSelected] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [awarded, setAwarded] = useState<number | null>(null)

  const question = challenge.question

  async function handleSubmit() {
    if (!selected) return
    setPending(true)
    setError(null)
    try {
      const result = await submit(selected)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setChallenge(result.data)
      setAwarded(result.data.points_awarded)
      if (result.data.points_awarded > 0) {
        toast.success(`Daily challenge done! +${result.data.points_awarded} XP`)
      }
      for (const achievement of result.data.new_achievements) {
        toast.success(`New badge: ${achievement.title}`, { description: achievement.description })
      }
    } catch {
      setError("We could not reach the server. Check your connection and try again.")
    } finally {
      setPending(false)
    }
  }

  if (!question) {
    return (
      <div className="rounded-4xl bg-white p-6 text-center shadow-card ring-1 ring-ink-900/5 sm:p-10">
        <Spark mood={challenge.completed ? "celebrate" : "thinking"} size={110} className="mx-auto" />
        <p className="mt-4 font-heading text-2xl font-semibold">
          {challenge.completed ? "Today's challenge is done!" : "No challenge today"}
        </p>
        <p className="mt-1 text-ink-500">
          {challenge.completed
            ? "Come back tomorrow for a new question."
            : "There are no published quiz questions to choose from yet."}
        </p>
      </div>
    )
  }

  const result = challenge.result

  return (
    <div className="rounded-4xl bg-white p-5 shadow-card ring-1 ring-ink-900/5 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Badge variant="sun">
          <CalendarCheck aria-hidden="true" />
          Daily challenge
        </Badge>
        <span className="inline-flex items-center gap-1 font-heading font-bold text-electric-700">
          <Zap className="size-4" aria-hidden="true" />
          {challenge.xp_reward} XP for taking part
        </span>
      </div>

      <AnswerOptions
        name="daily-challenge"
        legend={question.question_text}
        options={question.options.map((option) => ({ id: option.id, text: option.option_text }))}
        value={selected}
        onChange={setSelected}
        disabled={pending}
        verdict={
          result
            ? {
                selectedOptionId: result.selected_option_id,
                correctOptionId: result.correct_option_id,
              }
            : null
        }
      />

      <div className="mt-6" role="status" aria-live="polite">
        {result ? (
          <div
            className={
              result.is_correct
                ? "flex items-start gap-4 rounded-3xl bg-aqua-50 p-4 ring-1 ring-aqua-100"
                : "flex items-start gap-4 rounded-3xl bg-sun-50 p-4 ring-1 ring-sun-100"
            }
          >
            <Spark mood={result.is_correct ? "celebrate" : "thinking"} size={72} />
            <div>
              <p className="font-heading text-xl font-semibold text-ink-900">
                {result.is_correct ? "Correct! Well done." : "Not quite. Good try!"}
              </p>
              {result.explanation ? <p className="mt-1 text-ink-700">{result.explanation}</p> : null}
              <p className="mt-2 text-sm font-bold text-ink-600">
                {awarded !== null && awarded > 0
                  ? `You earned ${awarded} XP. `
                  : "You have completed today's challenge. "}
                Come back tomorrow for a new question.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          From the lesson{" "}
          <Link
            href={routes.child.lesson(question.lesson_slug)}
            className="font-bold text-electric-700 underline underline-offset-4"
          >
            {question.lesson_title}
          </Link>
        </p>
        {result ? null : (
          <Button size="lg" onClick={handleSubmit} disabled={!selected || pending}>
            {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
            {pending ? "Checking…" : "Check my answer"}
          </Button>
        )}
      </div>
    </div>
  )
}
