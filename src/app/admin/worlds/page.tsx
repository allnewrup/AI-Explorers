import type { Metadata } from "next"
import { Suspense } from "react"
import { WorldForm } from "@/components/admin/world-form"
import { EmptyState } from "@/components/feedback/empty-state"
import { CardGridSkeleton } from "@/components/feedback/skeletons"
import { PageHeader } from "@/components/layout/page-header"
import { WorldArt } from "@/components/lessons/world-art"
import { Badge } from "@/components/ui/badge"
import { listLessonsForAdmin, listWorldsForAdmin } from "@/features/admin-content/queries"
import { requireAdmin } from "@/lib/auth/session"
import { pluralise } from "@/lib/format"

export const metadata: Metadata = { title: "Learning worlds" }

export default function AdminWorldsPage() {
  return (
    <Suspense fallback={<CardGridSkeleton cards={4} />}>
      <AdminWorlds />
    </Suspense>
  )
}

async function AdminWorlds() {
  await requireAdmin()
  const [worlds, lessons] = await Promise.all([listWorldsForAdmin(), listLessonsForAdmin()])

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Learning worlds"
        description="Worlds are the categories lessons are grouped into. Deactivating a world hides it and all of its lessons from families; nothing is deleted."
      />

      {worlds.length === 0 ? (
        <EmptyState title="No worlds yet" description="Create the first learning world below." />
      ) : (
        <ul className="grid gap-6">
          {worlds.map((world) => {
            const inWorld = lessons.filter((lesson) => lesson.worldId === world.id)
            const published = inWorld.filter((lesson) => lesson.status === "published").length
            return (
              <li
                key={world.id}
                className="grid gap-5 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5 lg:grid-cols-[14rem_1fr]"
              >
                <div className="grid content-start gap-3">
                  <WorldArt imageKey={world.imageKey} />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={world.isActive ? "aqua" : "neutral"}>
                      {world.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {pluralise(inWorld.length, "lesson")} · {published} published
                    </Badge>
                  </div>
                </div>
                <div>
                  <h2 className="mb-4 text-xl font-semibold text-ink-900">{world.title}</h2>
                  {/* key: reset the form's fields when the saved data changes */}
                  <WorldForm
                    key={`${world.id}:${world.title}:${world.slug}:${world.isActive}:${world.displayOrder}:${world.imageKey}:${world.ageBand}`}
                    world={world}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <section
        aria-labelledby="new-world"
        className="rounded-3xl border-2 border-dashed border-ink-300 bg-white/60 p-5 sm:p-7"
      >
        <h2 id="new-world" className="mb-4 text-2xl font-semibold text-ink-900">
          Add a world
        </h2>
        <WorldForm />
      </section>
    </div>
  )
}
