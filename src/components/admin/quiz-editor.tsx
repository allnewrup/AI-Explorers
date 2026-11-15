"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { ErrorText } from "@/components/admin/list-editors"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RECOMMENDED_QUIZ_LENGTH } from "@/config/gamification"
import type { LessonInput } from "@/features/admin-content/schemas"

type Quiz = LessonInput["quiz"]
type Question = Quiz["questions"][number]

const MAX_QUESTIONS = 20
const MAX_OPTIONS = 6

function blankQuestion(): Question {
  return {
    question_text: "",
    explanation: "",
    options: [
      { option_text: "", is_correct: true },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  }
}

/**
 * Quiz editor. This is the one screen where the answer key is visible: it is
 * loaded through `admin_get_lesson`, which only administrators can call.
 */
export function QuizEditor({
  quiz,
  onChange,
  errorsFor,
}: {
  quiz: Quiz
  onChange: (quiz: Quiz) => void
  /** Messages for a field path such as "quiz.questions.0.options". */
  errorsFor: (path: string) => string[] | undefined
}) {
  const setQuestion = (index: number, patch: Partial<Question>) =>
    onChange({
      ...quiz,
      questions: quiz.questions.map((question, i) => (i === index ? { ...question, ...patch } : question)),
    })

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= quiz.questions.length) return
    const questions = [...quiz.questions]
    const [moved] = questions.splice(index, 1)
    if (!moved) return
    questions.splice(target, 0, moved)
    onChange({ ...quiz, questions })
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div className="grid gap-2">
          <Label htmlFor="quiz-title">Quiz title</Label>
          <Input
            id="quiz-title"
            value={quiz.title}
            maxLength={120}
            placeholder="Defaults to “Lesson quiz”"
            onChange={(event) => onChange({ ...quiz, title: event.target.value })}
          />
          <ErrorText messages={errorsFor("quiz.title")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="quiz-pass">Pass mark (%)</Label>
          <Input
            id="quiz-pass"
            type="number"
            min={0}
            max={100}
            value={quiz.passing_score}
            onChange={(event) => onChange({ ...quiz, passing_score: Number(event.target.value) || 0 })}
          />
          <ErrorText messages={errorsFor("quiz.passing_score")} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quiz-instructions">Instructions shown before the quiz</Label>
        <Textarea
          id="quiz-instructions"
          value={quiz.instructions}
          maxLength={600}
          rows={2}
          className="min-h-16"
          onChange={(event) => onChange({ ...quiz, instructions: event.target.value })}
        />
        <ErrorText messages={errorsFor("quiz.instructions")} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-heading text-lg font-semibold text-ink-900">
          Questions <span className="text-ink-500">({quiz.questions.length})</span>
        </p>
        <Badge variant={quiz.questions.length === RECOMMENDED_QUIZ_LENGTH ? "aqua" : "neutral"}>
          {RECOMMENDED_QUIZ_LENGTH} questions recommended
        </Badge>
      </div>
      <ErrorText messages={errorsFor("quiz.questions")} />

      {quiz.questions.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-ink-300 p-5 text-center text-ink-500">
          No questions yet. A lesson needs at least one question before it can be published.
        </p>
      ) : null}

      <ol className="grid gap-5">
        {quiz.questions.map((question, qIndex) => {
          const base = `quiz.questions.${qIndex}`
          return (
            <li key={question.id ?? `new-${qIndex}`} className="grid gap-4 rounded-3xl bg-mist p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading text-lg font-semibold text-ink-900">Question {qIndex + 1}</p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move question ${qIndex + 1} up`}
                    disabled={qIndex === 0}
                    onClick={() => move(qIndex, -1)}
                  >
                    <ArrowUp aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Move question ${qIndex + 1} down`}
                    disabled={qIndex === quiz.questions.length - 1}
                    onClick={() => move(qIndex, 1)}
                  >
                    <ArrowDown aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-coral-700 hover:bg-coral-50 hover:text-coral-700"
                    aria-label={`Remove question ${qIndex + 1}`}
                    onClick={() =>
                      onChange({ ...quiz, questions: quiz.questions.filter((_, i) => i !== qIndex) })
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`q-${qIndex}-text`}>Question</Label>
                <Textarea
                  id={`q-${qIndex}-text`}
                  value={question.question_text}
                  maxLength={400}
                  rows={2}
                  className="min-h-16"
                  onChange={(event) => setQuestion(qIndex, { question_text: event.target.value })}
                />
                <ErrorText messages={errorsFor(`${base}.question_text`)} />
              </div>

              <fieldset className="grid gap-2">
                <legend className="text-sm font-bold text-ink-800">
                  Answer choices. Select the one correct answer.
                </legend>
                {question.options.map((option, oIndex) => (
                  <div key={option.id ?? `new-${oIndex}`} className="flex items-center gap-2">
                    <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-bold text-ink-700 ring-1 ring-ink-200 has-checked:bg-aqua-50 has-checked:text-aqua-700 has-checked:ring-aqua-500 has-focus-visible:outline-3 has-focus-visible:outline-ring">
                      <input
                        type="radio"
                        name={`q-${qIndex}-correct`}
                        checked={option.is_correct}
                        onChange={() =>
                          setQuestion(qIndex, {
                            options: question.options.map((item, i) => ({ ...item, is_correct: i === oIndex })),
                          })
                        }
                        className="size-4 accent-aqua-700"
                      />
                      <span>
                        Correct<span className="sr-only"> answer is choice {oIndex + 1}</span>
                      </span>
                    </label>
                    <Input
                      aria-label={`Question ${qIndex + 1}, choice ${oIndex + 1}`}
                      value={option.option_text}
                      maxLength={240}
                      onChange={(event) =>
                        setQuestion(qIndex, {
                          options: question.options.map((item, i) =>
                            i === oIndex ? { ...item, option_text: event.target.value } : item
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove choice ${oIndex + 1} from question ${qIndex + 1}`}
                      disabled={question.options.length <= 2}
                      onClick={() => {
                        const remaining = question.options.filter((_, i) => i !== oIndex)
                        // Keep exactly one correct answer if the correct one was removed.
                        const fixed = remaining.some((item) => item.is_correct)
                          ? remaining
                          : remaining.map((item, i) => ({ ...item, is_correct: i === 0 }))
                        setQuestion(qIndex, { options: fixed })
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                <ErrorText
                  messages={[
                    ...(errorsFor(`${base}.options`) ?? []),
                    ...question.options.flatMap(
                      (_, oIndex) => errorsFor(`${base}.options.${oIndex}.option_text`) ?? []
                    ),
                  ]}
                />
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={question.options.length >= MAX_OPTIONS}
                    onClick={() =>
                      setQuestion(qIndex, {
                        options: [...question.options, { option_text: "", is_correct: false }],
                      })
                    }
                  >
                    <Plus aria-hidden="true" />
                    Add choice
                  </Button>
                </div>
              </fieldset>

              <div className="grid gap-2">
                <Label htmlFor={`q-${qIndex}-explanation`}>
                  Explanation shown after answering
                </Label>
                <Textarea
                  id={`q-${qIndex}-explanation`}
                  value={question.explanation}
                  maxLength={600}
                  rows={2}
                  className="min-h-16"
                  onChange={(event) => setQuestion(qIndex, { explanation: event.target.value })}
                />
                <ErrorText messages={errorsFor(`${base}.explanation`)} />
              </div>
            </li>
          )
        })}
      </ol>

      <div>
        <Button
          type="button"
          variant="secondary"
          disabled={quiz.questions.length >= MAX_QUESTIONS}
          onClick={() => onChange({ ...quiz, questions: [...quiz.questions, blankQuestion()] })}
        >
          <Plus aria-hidden="true" />
          Add question
        </Button>
      </div>
    </div>
  )
}
