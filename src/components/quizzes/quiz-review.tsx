import { CircleCheck, CircleX } from "lucide-react"
import { cn } from "cn"
import { Spark } from "@/components/mascot/spark"
import type { AttemptReview } from "@/features/quizzes/queries"
import { formatDateTime } from "@/lib/format"

/** A stored quiz attempt, answer by answer. */
export function QuizReview({
  attempt,
  lessonTitle,
  actions,
}: {
  attempt: AttemptReview
  lessonTitle: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="flex flex-col items-center gap-5 rounded-4xl bg-white p-6 text-center shadow-card ring-1 ring-ink-900/5 sm:flex-row sm:p-8 sm:text-left">
        <Spark mood={attempt.passed ? "celebrate" : "happy"} size={120} />
        <div className="flex-1">
          <p className="font-heading text-sm font-semibold tracking-widest text-electric-600 uppercase">
            Quiz results
          </p>
          <h1 className="mt-1 text-3xl font-semibold">{lessonTitle}</h1>
          <p className="mt-2 text-lg text-ink-700">
            <strong>
              {attempt.correctAnswers} out of {attempt.totalQuestions}
            </strong>{" "}
            correct ({attempt.score}%).{" "}
            {attempt.passed ? "Passed." : `The pass mark is ${attempt.passingScore}%.`}
          </p>
          <p className="mt-1 text-sm text-ink-500">Completed {formatDateTime(attempt.completedAt)}</p>
        </div>
        <div
          className={cn(
            "flex size-24 shrink-0 flex-col items-center justify-center rounded-full font-heading font-bold",
            attempt.passed ? "bg-aqua-100 text-aqua-700" : "bg-sun-100 text-sun-700"
          )}
          aria-hidden="true"
        >
          <span className="text-3xl leading-none">{attempt.score}%</span>
        </div>
      </header>

      <ol className="grid gap-4">
        {attempt.responses.map((response, index) => (
          <li
            key={response.id}
            className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                  response.isCorrect ? "bg-aqua-100 text-aqua-700" : "bg-coral-100 text-coral-700"
                )}
              >
                {response.isCorrect ? (
                  <CircleCheck className="size-5" aria-hidden="true" />
                ) : (
                  <CircleX className="size-5" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-500">
                  Question {index + 1} · {response.isCorrect ? "Correct" : "Incorrect"}
                </p>
                <p className="font-heading text-lg font-semibold text-ink-900">{response.questionText}</p>
                <dl className="mt-3 grid gap-2 text-ink-700">
                  <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <dt className="shrink-0 font-bold">Your answer:</dt>
                    <dd>{response.selectedOptionText}</dd>
                  </div>
                  {response.isCorrect ? null : (
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                      <dt className="shrink-0 font-bold">Correct answer:</dt>
                      <dd>{response.correctOptionText}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {actions ? <div className="flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  )
}
