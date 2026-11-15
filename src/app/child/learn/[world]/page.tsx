import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { EmptyState } from "@/components/feedback/empty-state"
import { CardGridSkeleton } from "@/components/feedback/skeletons"
import { LessonCard } from "@/components/lessons/cards"
import { getWorldTheme, WorldArt } from "@/components/lessons/world-art"
import { BackLink } from "@/components/navigation/back-link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AGE_BAND_LABELS } from "@/config/age-bands"
import { routes } from "@/config/site"
import { getActiveWorldBySlug, getLearningPath } from "@/features/curriculum/queries"
import { requireActiveChild } from "@/lib/auth/session"
import { pluralise } from "@/lib/format"

export const metadata: Metadata = { title: "Learning world" }

export default function WorldPage({ params }: PageProps<"/child/learn/[world]">) {
  return (
    <Suspense fallback={<CardGridSkeleton cards={3} />}>
      <WorldContent params={params} />
    </Suspense>
  )
}

async function WorldContent({ params }: Pick<PageProps<"/child/learn/[world]">, "params">) {
  const { world: slug } = await params
  const child = await requireActiveChild()

  const world = await getActiveWorldBySlug(slug)
  if (!world) notFound()

  const lessons = (await getLearningPath(child.id)).filter((lesson) => lesson.worldId === world.id)
  const completed = lessons.filter((lesson) => lesson.progress === "completed").length
  const theme = getWorldTheme(world.imageKey)

  return (
    <div className="grid gap-8">
      <BackLink href={routes.child.learn}>All worlds</BackLink>

      <header className="grid gap-5 rounded-4xl bg-white p-4 shadow-card ring-1 ring-ink-900/5 md:grid-cols-[18rem_1fr] md:p-6">
        <WorldArt imageKey={world.imageKey} size="lg" className="h-44 md:h-full" />
        <div className="flex flex-col gap-3 p-1">
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">{AGE_BAND_LABELS[world.ageBand]}</Badge>
            <Badge variant="outline">{pluralise(lessons.length, "lesson")}</Badge>
          </div>
          <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{world.title}</h1>
          <p className="text-lg text-ink-500">{world.description}</p>
          <div className="mt-auto pt-2">
            <p className="mb-1.5 text-sm font-bold text-ink-600">
              {completed} of {lessons.length} lessons completed
            </p>
            <Progress
              value={completed}
              max={Math.max(lessons.length, 1)}
              label={`${world.title} progress`}
              tone={theme.tone}
            />
          </div>
        </div>
      </header>

      <section aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="mb-4 text-2xl font-semibold">
          Lessons
        </h2>
        {lessons.length > 0 ? (
          <ol className="grid gap-4">
            {lessons.map((lesson, index) => (
              <li key={lesson.id}>
                <LessonCard lesson={lesson} index={index} />
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="No lessons in this world yet"
            description="Lessons for this world are still being written. Try another world for now."
          />
        )}
      </section>
    </div>
  )
}
