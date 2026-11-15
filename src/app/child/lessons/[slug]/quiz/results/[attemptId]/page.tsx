import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { z } from "zod"
import { ArticleSkeleton } from "@/components/feedback/skeletons"
import { QuizReview } from "@/components/quizzes/quiz-review"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { getPublishedLessonBySlug } from "@/features/lessons/queries"
import { getCompletedAttempt } from "@/features/quizzes/queries"
import { requireActiveChild } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Quiz results" }

type Props = PageProps<"/child/lessons/[slug]/quiz/results/[attemptId]">

export default function QuizResultsPage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ResultsContent params={params} />
    </Suspense>
  )
}

async function ResultsContent({ params }: Pick<Props, "params">) {
  const { slug, attemptId } = await params
  const child = await requireActiveChild()

  if (!z.uuid().safeParse(attemptId).success) notFound()

  // Read back from the database, scoped to the active child. Another child's
  // attempt id (even a sibling's) is simply "not found".
  const [lesson, attempt] = await Promise.all([
    getPublishedLessonBySlug(slug),
    getCompletedAttempt(child.id, attemptId),
  ])
  if (!attempt) notFound()

  return (
    <QuizReview
      attempt={attempt}
      lessonTitle={lesson?.title ?? "Quiz"}
      actions={
        <>
          {lesson ? (
            <>
              <Button asChild>
                <Link href={routes.child.quiz(lesson.slug)}>Try the quiz again</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={routes.child.lesson(lesson.slug)}>Back to the lesson</Link>
              </Button>
            </>
          ) : null}
          <Button asChild variant="ghost">
            <Link href={routes.child.learn}>More lessons</Link>
          </Button>
        </>
      }
    />
  )
}
