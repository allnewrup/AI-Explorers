import Link from "next/link"
import { ArrowRight, CircleCheck, CirclePlay, Clock, FlaskConical, VideoOff } from "lucide-react"
import { cn } from "cn"
import { getWorldTheme, WorldArt } from "@/components/lessons/world-art"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AGE_BAND_LABELS, type AgeBand } from "@/config/age-bands"
import { routes } from "@/config/site"
import type { PathLesson, ProgressState } from "@/features/lessons/learning-path"
import { percent, pluralise } from "@/lib/format"

/** Marks original demonstration content shipped with the seed. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge variant="sun" className={className}>
      <FlaskConical aria-hidden="true" />
      Sample lesson
    </Badge>
  )
}

export function WorldCard({
  world,
}: {
  world: {
    slug: string
    title: string
    description: string
    imageKey: string
    ageBand: AgeBand
    lessonCount: number
    completedCount: number
  }
}) {
  const theme = getWorldTheme(world.imageKey)
  const done = world.lessonCount > 0 && world.completedCount === world.lessonCount

  return (
    <Link
      href={routes.child.world(world.slug)}
      className="group flex h-full flex-col gap-3 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink-900/5 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lift"
    >
      <WorldArt imageKey={world.imageKey} />
      <div className="flex flex-1 flex-col gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="neutral">{AGE_BAND_LABELS[world.ageBand]}</Badge>
          <Badge variant="outline">{pluralise(world.lessonCount, "lesson")}</Badge>
          {done ? (
            <Badge variant="aqua">
              <CircleCheck aria-hidden="true" />
              Complete
            </Badge>
          ) : null}
        </div>
        <h3 className="text-xl font-semibold text-ink-900 group-hover:text-electric-700">{world.title}</h3>
        <p className="text-ink-500">{world.description}</p>
        <div className="mt-auto pt-2">
          <div className="mb-1.5 flex items-center justify-between text-sm font-bold text-ink-600">
            <span>
              {world.completedCount} of {world.lessonCount} done
            </span>
            <span aria-hidden="true">{percent(world.completedCount, world.lessonCount)}%</span>
          </div>
          <Progress
            value={world.completedCount}
            max={Math.max(world.lessonCount, 1)}
            label={`${world.title} progress`}
            tone={theme.tone}
          />
        </div>
      </div>
    </Link>
  )
}

const STATE_COPY: Record<ProgressState, { label: string; cta: string }> = {
  not_started: { label: "Not started", cta: "Start" },
  in_progress: { label: "In progress", cta: "Continue" },
  completed: { label: "Completed", cta: "Review" },
}

export function LessonCard({ lesson, index }: { lesson: PathLesson; index?: number }) {
  const copy = STATE_COPY[lesson.progress]
  return (
    <Link
      href={routes.child.lesson(lesson.slug)}
      className="group flex items-center gap-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-ink-900/5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card sm:p-5"
    >
      <span
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-2xl font-heading text-xl font-bold",
          lesson.progress === "completed" && "bg-aqua-100 text-aqua-700",
          lesson.progress === "in_progress" && "bg-sun-100 text-sun-700",
          lesson.progress === "not_started" && "bg-electric-100 text-electric-700"
        )}
        aria-hidden="true"
      >
        {lesson.progress === "completed" ? (
          <CircleCheck className="size-7" />
        ) : index !== undefined ? (
          index + 1
        ) : (
          <CirclePlay className="size-7" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-ink-900 group-hover:text-electric-700">{lesson.title}</h3>
        <p className="line-clamp-2 text-sm text-ink-500">{lesson.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-ink-600">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {lesson.estimatedMinutes} min
          </span>
          <span aria-hidden="true">·</span>
          <span>{copy.label}</span>
          {lesson.hasVideo ? null : (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <VideoOff className="size-3.5" aria-hidden="true" />
                Video coming soon
              </span>
            </>
          )}
          {lesson.isSample ? <SampleBadge className="ml-1" /> : null}
        </div>
      </div>
      <span className="hidden shrink-0 items-center gap-1 font-heading font-semibold text-electric-700 sm:inline-flex">
        {copy.cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  )
}
