import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CircleCheck, Eye } from "lucide-react"
import { z } from "zod"
import { StatusBadge } from "@/components/admin/status-badge"
import { ArticleSkeleton } from "@/components/feedback/skeletons"
import { LessonView } from "@/components/lessons/lesson-view"
import { BackLink } from "@/components/navigation/back-link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { getLessonForAdmin, listWorldsForAdmin } from "@/features/admin-content/queries"
import { getLessonMedia } from "@/features/lessons/queries"
import { requireAdmin } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Lesson preview" }

export default function LessonPreviewPage({ params }: PageProps<"/admin/lessons/[id]/preview">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <LessonPreview params={params} />
    </Suspense>
  )
}

/**
 * Admin-only preview. It lives under /admin and loads the lesson through
 * `admin_get_lesson`, so it works for drafts without ever making a draft
 * reachable from the child area.
 */
async function LessonPreview({ params }: Pick<PageProps<"/admin/lessons/[id]/preview">, "params">) {
  const { id } = await params
  await requireAdmin()
  if (!z.uuid().safeParse(id).success) notFound()

  const [lesson, worlds] = await Promise.all([getLessonForAdmin(id), listWorldsForAdmin()])
  if (!lesson) notFound()

  const world = worlds.find((item) => item.id === lesson.learning_world_id)
  const media = await getLessonMedia({
    videoAssetKey: lesson.video_asset_key,
    captionsAssetKey: lesson.captions_asset_key,
  })

  return (
    <LessonView
      trackProgress={false}
      media={media}
      lesson={{
        title: lesson.title,
        description: lesson.description,
        ageBand: lesson.age_band,
        difficulty: lesson.difficulty,
        estimatedMinutes: lesson.estimated_minutes,
        learningObjectives: lesson.learning_objectives,
        transcript: lesson.transcript,
        keyTerms: lesson.key_terms,
        keyTakeaways: lesson.key_takeaways,
        advantages: lesson.advantages,
        limitations: lesson.limitations,
        safetyNotes: lesson.safety_notes,
        isSample: lesson.is_sample,
        worldTitle: world?.title ?? "Unknown world",
      }}
      breadcrumb={<BackLink href={routes.admin.lesson(lesson.id)}>Back to the editor</BackLink>}
      banner={
        <Alert variant="warning">
          <Eye aria-hidden="true" />
          <AlertTitle className="flex flex-wrap items-center gap-2">
            Administrator preview
            <StatusBadge status={lesson.status} />
          </AlertTitle>
          <AlertDescription>
            {lesson.status === "published"
              ? "This lesson is live. This is how families see it."
              : "This lesson is not published. Families cannot open it, even with a direct link."}
          </AlertDescription>
        </Alert>
      }
      footer={
        <section
          aria-labelledby="quiz-preview"
          className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5 sm:p-7"
        >
          <h2 id="quiz-preview" className="text-2xl font-semibold text-ink-900">
            Quiz ({lesson.quiz?.questions.length ?? 0} questions)
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Answer key shown for administrators only. Children see the choices without it.
          </p>
          {lesson.quiz && lesson.quiz.questions.length > 0 ? (
            <ol className="mt-5 grid gap-5">
              {lesson.quiz.questions.map((question, index) => (
                <li key={question.id} className="rounded-2xl bg-mist p-4">
                  <p className="font-heading text-lg font-semibold text-ink-900">
                    {index + 1}. {question.question_text}
                  </p>
                  <ul className="mt-3 grid gap-2">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={
                          option.is_correct
                            ? "flex items-center gap-2 rounded-xl bg-aqua-50 px-3 py-2 font-semibold text-aqua-700 ring-1 ring-aqua-300"
                            : "rounded-xl bg-white px-3 py-2 text-ink-700 ring-1 ring-ink-200"
                        }
                      >
                        {option.is_correct ? <CircleCheck className="size-4 shrink-0" aria-hidden="true" /> : null}
                        {option.option_text}
                        {option.is_correct ? <span className="sr-only"> (correct answer)</span> : null}
                      </li>
                    ))}
                  </ul>
                  {question.explanation ? (
                    <p className="mt-3 text-sm text-ink-600">
                      <span className="font-bold">Explanation:</span> {question.explanation}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-ink-500">This lesson has no quiz questions yet.</p>
          )}
          <div className="mt-6">
            <Button asChild>
              <Link href={routes.admin.lesson(lesson.id)}>Edit this lesson</Link>
            </Button>
          </div>
        </section>
      }
    />
  )
}
