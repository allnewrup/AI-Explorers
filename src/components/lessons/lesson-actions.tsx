"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { ArrowRight, CircleCheck, LoaderCircle, PartyPopper } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { XP_RULES } from "@/config/gamification"
import { completeLessonAction, recordLessonProgressAction } from "@/features/lessons/actions"
import type { LessonCompletion } from "@/features/lessons/schemas"
import type { ActionResult } from "@/lib/action-result"

/**
 * Tells the server that the active child opened this lesson, once per view.
 * Done from an effect (not during render) so link prefetching and server
 * re-renders never count as "started".
 */
export function LessonStartTracker({
  lessonId,
  alreadyStarted,
}: {
  lessonId: string
  alreadyStarted: boolean
}) {
  const sent = useRef(false)
  useEffect(() => {
    if (alreadyStarted || sent.current) return
    sent.current = true
    void recordLessonProgressAction(lessonId, false)
  }, [lessonId, alreadyStarted])
  return null
}

/**
 * Quiz entry point and lesson completion.
 *
 * The XP shown after completing comes back from the server. This component
 * never calculates or stores points itself.
 */
export function LessonActions({
  lessonId,
  quizHref,
  hasQuiz,
  questionCount,
  initiallyCompleted,
  complete = completeLessonAction,
}: {
  lessonId: string
  quizHref: string
  hasQuiz: boolean
  questionCount: number
  initiallyCompleted: boolean
  /** Injectable for tests. */
  complete?: (lessonId: string) => Promise<ActionResult<LessonCompletion>>
}) {
  const [completed, setCompleted] = useState(initiallyCompleted)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleComplete() {
    setError(null)
    startTransition(async () => {
      const result = await complete(lessonId)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setCompleted(true)
      if (result.data.points_awarded > 0) {
        toast.success(`Lesson complete! +${result.data.points_awarded} XP`, {
          description: `You now have ${result.data.total_xp} XP.`,
        })
      } else {
        toast.success("Lesson marked as complete.")
      }
      for (const achievement of result.data.new_achievements) {
        toast.success(`New badge: ${achievement.title}`, { description: achievement.description })
      }
    })
  }

  return (
    <section
      aria-labelledby="lesson-next"
      className="rounded-3xl bg-linear-to-br from-electric-600 to-nebula-600 p-6 text-white shadow-card sm:p-8"
    >
      <h2 id="lesson-next" className="text-2xl font-semibold">
        {completed ? "Lesson complete!" : "Finished reading?"}
      </h2>

      <div className="mt-2" role="status" aria-live="polite">
        {completed ? (
          <p className="flex items-center gap-2 text-lg text-white/90">
            <CircleCheck className="size-5 shrink-0 text-aqua-300" aria-hidden="true" />
            You have completed this lesson.
          </p>
        ) : (
          <p className="text-lg text-white/90">
            Mark the lesson as complete to earn {XP_RULES.lessonCompleted} XP.
          </p>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-xl bg-white/15 px-4 py-2 font-semibold">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {completed ? null : (
          <Button variant="playful" size="lg" onClick={handleComplete} disabled={pending}>
            {pending ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <PartyPopper aria-hidden="true" />
            )}
            {pending ? "Saving…" : "I finished this lesson"}
          </Button>
        )}
        {hasQuiz ? (
          <Button asChild size="lg" variant={completed ? "playful" : "outline"}>
            <Link href={quizHref}>
              Take the quiz ({questionCount} questions)
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <p className="self-center text-white/80">This lesson does not have a quiz yet.</p>
        )}
      </div>
    </section>
  )
}
