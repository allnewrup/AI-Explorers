import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { LessonEditor } from "@/components/admin/lesson-editor"
import { EmptyState } from "@/components/feedback/empty-state"
import { FormSkeleton } from "@/components/feedback/skeletons"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { listWorldsForAdmin } from "@/features/admin-content/queries"
import { emptyLessonInput } from "@/features/admin-content/schemas"
import { requireAdmin } from "@/lib/auth/session"

export const metadata: Metadata = { title: "New lesson" }

export default function NewLessonPage() {
  return (
    <Suspense fallback={<FormSkeleton fields={6} />}>
      <NewLesson />
    </Suspense>
  )
}

async function NewLesson() {
  await requireAdmin()
  const worlds = await listWorldsForAdmin()
  const firstWorld = worlds.find((world) => world.isActive) ?? worlds[0]

  if (!firstWorld) {
    return (
      <EmptyState
        title="Create a learning world first"
        description="Every lesson belongs to a learning world, and there are none yet."
        action={
          <Button asChild>
            <Link href={routes.admin.worlds}>Manage worlds</Link>
          </Button>
        }
      />
    )
  }

  return (
    <LessonEditor
      lessonId={null}
      status="draft"
      initialValues={emptyLessonInput(firstWorld.id)}
      worlds={worlds.map((world) => ({ id: world.id, title: world.title, isActive: world.isActive }))}
    />
  )
}
