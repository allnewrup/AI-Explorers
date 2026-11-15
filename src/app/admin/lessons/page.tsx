import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Plus, Video, VideoOff } from "lucide-react"
import { StatusBadge } from "@/components/admin/status-badge"
import { EmptyState } from "@/components/feedback/empty-state"
import { TableSkeleton } from "@/components/feedback/skeletons"
import { PageHeader } from "@/components/layout/page-header"
import { SampleBadge } from "@/components/lessons/cards"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AGE_BAND_LABELS } from "@/config/age-bands"
import { routes } from "@/config/site"
import { listLessonsForAdmin, type AdminLessonRow } from "@/features/admin-content/queries"
import { requireAdmin } from "@/lib/auth/session"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Lessons" }

export default function AdminLessonsPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <AdminLessons />
    </Suspense>
  )
}

async function AdminLessons() {
  await requireAdmin()
  const lessons = await listLessonsForAdmin()

  const groups = new Map<string, AdminLessonRow[]>()
  for (const lesson of lessons) {
    groups.set(lesson.worldTitle, [...(groups.get(lesson.worldTitle) ?? []), lesson])
  }

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Lessons"
        description="Drafts are visible only to administrators. Publishing makes a lesson and its quiz available to families."
        actions={
          <Button asChild>
            <Link href={routes.admin.newLesson}>
              <Plus aria-hidden="true" />
              New lesson
            </Link>
          </Button>
        }
      />

      {lessons.length === 0 ? (
        <EmptyState
          title="No lessons yet"
          description="Create the first lesson, or run the seed script to load the sample curriculum."
          action={
            <Button asChild>
              <Link href={routes.admin.newLesson}>Create a lesson</Link>
            </Button>
          }
        />
      ) : (
        [...groups.entries()].map(([worldTitle, rows]) => (
          <section key={worldTitle} aria-label={worldTitle} className="grid gap-3">
            <h2 className="text-xl font-semibold text-ink-900">{worldTitle}</h2>
            <div className="overflow-x-auto rounded-3xl bg-white shadow-soft ring-1 ring-ink-900/5">
              <table className="w-full min-w-[42rem] text-left">
                <caption className="sr-only">Lessons in {worldTitle}</caption>
                <thead className="border-b border-ink-100 text-sm text-ink-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-bold">Lesson</th>
                    <th scope="col" className="px-3 py-3 font-bold">Status</th>
                    <th scope="col" className="px-3 py-3 font-bold">Video</th>
                    <th scope="col" className="px-3 py-3 font-bold">Updated</th>
                    <th scope="col" className="px-5 py-3 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {rows.map((lesson) => (
                    <tr key={lesson.id}>
                      <th scope="row" className="px-5 py-4 font-normal">
                        <Link
                          href={routes.admin.lesson(lesson.id)}
                          className="rounded font-heading text-lg font-semibold text-ink-900 underline-offset-4 hover:text-electric-700 hover:underline"
                        >
                          {lesson.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <code className="text-xs text-ink-500">/{lesson.slug}</code>
                          <Badge variant="neutral">{AGE_BAND_LABELS[lesson.ageBand]}</Badge>
                          {lesson.isSample ? <SampleBadge /> : null}
                        </div>
                      </th>
                      <td className="px-3 py-4">
                        <StatusBadge status={lesson.status} />
                      </td>
                      <td className="px-3 py-4 text-sm text-ink-600">
                        {lesson.hasVideo ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Video className="size-4 text-aqua-700" aria-hidden="true" />
                            Attached
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <VideoOff className="size-4 text-ink-400" aria-hidden="true" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-sm text-ink-600">{formatDate(lesson.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={routes.admin.lesson(lesson.id)}>
                              Edit<span className="sr-only"> {lesson.title}</span>
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={routes.admin.lessonPreview(lesson.id)}>
                              Preview<span className="sr-only"> {lesson.title}</span>
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  )
}
