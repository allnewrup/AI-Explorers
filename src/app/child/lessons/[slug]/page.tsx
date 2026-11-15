import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArticleSkeleton } from "@/components/feedback/skeletons"
import { LessonActions, LessonStartTracker } from "@/components/lessons/lesson-actions"
import { LessonView } from "@/components/lessons/lesson-view"
import { BackLink } from "@/components/navigation/back-link"
import { routes } from "@/config/site"
import {
  getLessonMedia,
  getLessonProgress,
  getPublishedLessonBySlug,
  getQuizForLesson,
} from "@/features/lessons/queries"
import { requireActiveChild } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Lesson" }

export default function LessonPage({ params }: PageProps<"/child/lessons/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <LessonContent params={params} />
    </Suspense>
  )
}

async function LessonContent({ params }: Pick<PageProps<"/child/lessons/[slug]">, "params">) {
  const { slug } = await params
  const child = await requireActiveChild()

  // Only published lessons in active worlds are returned. A draft's URL gives
  // the same "not found" page as a lesson that does not exist.
  const lesson = await getPublishedLessonBySlug(slug)
  if (!lesson) notFound()

  const [progress, media, quiz] = await Promise.all([
    getLessonProgress(child.id, lesson.id),
    getLessonMedia(lesson),
    getQuizForLesson(lesson.id),
  ])

  return (
    <>
      <LessonStartTracker lessonId={lesson.id} alreadyStarted={progress.started} />
      <LessonView
        lesson={{ ...lesson, worldTitle: lesson.world.title }}
        media={media}
        breadcrumb={<BackLink href={routes.child.world(lesson.world.slug)}>{lesson.world.title}</BackLink>}
        footer={
          <LessonActions
            lessonId={lesson.id}
            quizHref={routes.child.quiz(lesson.slug)}
            hasQuiz={quiz !== null}
            questionCount={quiz?.questions.length ?? 0}
            initiallyCompleted={progress.completed}
          />
        }
      />
    </>
  )
}
