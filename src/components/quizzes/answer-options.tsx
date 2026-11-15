"use client"

import { CircleCheck, CircleX } from "lucide-react"
import { cn } from "cn"

export type OptionVerdict = {
  selectedOptionId: string | null
  correctOptionId: string | null
}

const LETTERS = ["A", "B", "C", "D", "E", "F"]

/**
 * Multiple-choice answers as a native radio group.
 *
 * Native radios give arrow-key navigation, a single tab stop and correct
 * screen-reader semantics for free. Once the server has returned a verdict the
 * group is locked and each choice is labelled as correct / your answer in
 * text, not by colour alone.
 */
export function AnswerOptions({
  name,
  legend,
  options,
  value,
  onChange,
  verdict,
  disabled = false,
  legendRef,
}: {
  name: string
  legend: string
  options: { id: string; text: string }[]
  value: string | null
  onChange: (optionId: string) => void
  /** Present once the answer has been judged by the server. */
  verdict?: OptionVerdict | null
  disabled?: boolean
  legendRef?: React.Ref<HTMLLegendElement>
}) {
  const locked = Boolean(verdict) || disabled

  return (
    <fieldset className="grid gap-3">
      <legend
        ref={legendRef}
        tabIndex={-1}
        className="mb-4 font-heading text-2xl leading-snug font-semibold text-ink-900 outline-none sm:text-3xl"
      >
        {legend}
      </legend>
      {options.map((option, index) => {
        const isCorrect = verdict?.correctOptionId === option.id
        const isChosen = (verdict ? verdict.selectedOptionId : value) === option.id
        const isWrongChoice = Boolean(verdict) && isChosen && !isCorrect

        return (
          <label
            key={option.id}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 bg-white p-4 text-lg font-semibold transition-colors",
              !locked &&
                "cursor-pointer border-ink-200 text-ink-800 hover:border-electric-300 hover:bg-electric-50 has-checked:border-electric-500 has-checked:bg-electric-50 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
              locked && !verdict && "border-ink-200 text-ink-600 opacity-70",
              verdict && isCorrect && "border-aqua-600 bg-aqua-50 text-ink-900",
              verdict && isWrongChoice && "border-coral-500 bg-coral-50 text-ink-900",
              verdict && !isCorrect && !isWrongChoice && "border-ink-200 text-ink-500"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={isChosen}
              disabled={locked}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl font-heading text-lg font-bold",
                verdict && isCorrect
                  ? "bg-aqua-600 text-white"
                  : isWrongChoice
                    ? "bg-coral-600 text-white"
                    : isChosen
                      ? "bg-electric-600 text-white"
                      : "bg-ink-100 text-ink-700"
              )}
            >
              {LETTERS[index] ?? index + 1}
            </span>
            <span className="flex-1">{option.text}</span>
            {verdict && isCorrect ? (
              <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-aqua-700">
                <CircleCheck className="size-5" aria-hidden="true" />
                Correct answer
              </span>
            ) : null}
            {isWrongChoice ? (
              <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-coral-700">
                <CircleX className="size-5" aria-hidden="true" />
                Your answer
              </span>
            ) : null}
          </label>
        )
      })}
    </fieldset>
  )
}
