import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { z } from "zod"
import { LessonEditor } from "@/components/admin/lesson-editor"
import { FormSkeleton } from "@/components/feedback/skeletons"
import { getLessonForAdmin, listWorldsForAdmin } from "@/features/admin-content/queries"
import { toLessonInput } from "@/features/admin-content/schemas"
import { requireAdmin } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Edit lesson" }

export default function EditLessonPage({ params }: PageProps<"/admin/lessons/[id]">) {
  return (
    <Suspense fallback={<FormSkeleton fields={6} />}>
      <EditLesson params={params} />
    </Suspense>
  )
}

async function EditLesson({ params }: Pick<PageProps<"/admin/lessons/[id]">, "params">) {
  const { id } = await params
  await requireAdmin()
  if (!z.uuid().safeParse(id).success) notFound()

  const [lesson, worlds] = await Promise.all([getLessonForAdmin(id), listWorldsForAdmin()])
  if (!lesson) notFound()

  return (
    <LessonEditor
      // Remount with fresh server data after every save, so newly created
      // questions and options pick up their database ids.
      key={`${lesson.id}:${lesson.updated_at}:${lesson.versions.length}`}
      lessonId={lesson.id}
      status={lesson.status}
      initialValues={toLessonInput(lesson)}
      worlds={worlds.map((world) => ({ id: world.id, title: world.title, isActive: world.isActive }))}
      versions={lesson.versions}
    />
  )
}
