import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { EmptyState } from "@/components/feedback/empty-state"
import { ArticleSkeleton } from "@/components/feedback/skeletons"
import { QuizPlayer } from "@/components/quizzes/quiz-player"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { getPublishedLessonBySlug, getQuizForLesson } from "@/features/lessons/queries"
import { requireActiveChild } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Quiz" }

export default function QuizPage({ params }: PageProps<"/child/lessons/[slug]/quiz">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <QuizContent params={params} />
    </Suspense>
  )
}

async function QuizContent({ params }: Pick<PageProps<"/child/lessons/[slug]/quiz">, "params">) {
  const { slug } = await params
  await requireActiveChild()

  const lesson = await getPublishedLessonBySlug(slug)
  if (!lesson) notFound()

  // Questions and answer choices only. The answer key is not selectable.
  const quiz = await getQuizForLesson(lesson.id)

  if (!quiz) {
    return (
      <EmptyState
        title="This lesson does not have a quiz yet"
        description="The quiz for this lesson is still being written."
        action={
          <Button asChild>
            <Link href={routes.child.lesson(lesson.slug)}>Back to the lesson</Link>
          </Button>
        }
      />
    )
  }

  return <QuizPlayer quiz={quiz} lessonTitle={lesson.title} lessonSlug={lesson.slug} />
}
