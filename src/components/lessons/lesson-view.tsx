import {
  BookMarked,
  BookOpen,
  Clock,
  Lightbulb,
  ShieldCheck,
  Target,
  ThumbsDown,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { SampleBadge } from "@/components/lessons/cards"
import { LessonMediaPanel } from "@/components/lessons/lesson-media"
import { Badge } from "@/components/ui/badge"
import { AGE_BAND_LABELS, type AgeBand } from "@/config/age-bands"
import type { LessonMedia } from "@/features/lessons/queries"
import { toParagraphs } from "@/lib/format"

export type LessonContent = {
  id?: string
  title: string
  description: string
  ageBand: AgeBand
  difficulty: string
  estimatedMinutes: number
  learningObjectives: string[]
  transcript: string
  keyTerms: { term: string; definition: string }[]
  keyTakeaways: string[]
  advantages: string[]
  limitations: string[]
  safetyNotes: string[]
  isSample: boolean
  worldTitle: string
}

function Section({
  id,
  icon: Icon,
  title,
  tone,
  children,
  className,
}: {
  id: string
  icon: LucideIcon
  title: string
  tone: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section aria-labelledby={id} className={cn("rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5 sm:p-7", className)}>
      <h2 id={id} className="flex items-center gap-3 text-2xl font-semibold text-ink-900">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function BulletList({ items, marker }: { items: string[]; marker: string }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-lg text-ink-800">
          <span className={cn("mt-2.5 size-2.5 shrink-0 rounded-full", marker)} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * The full lesson, in a fixed order. Purely presentational: it is used both by
 * the child lesson page and by the admin preview, so what an administrator
 * previews is what a child will see.
 */
export function LessonView({
  lesson,
  media,
  breadcrumb,
  banner,
  footer,
  trackProgress = true,
}: {
  lesson: LessonContent
  media: LessonMedia
  breadcrumb?: React.ReactNode
  banner?: React.ReactNode
  /** Quiz entry point and completion controls. */
  footer?: React.ReactNode
  trackProgress?: boolean
}) {
  const paragraphs = toParagraphs(lesson.transcript)

  return (
    <article className="mx-auto grid max-w-3xl gap-6">
      {banner}
      <header className="grid gap-4">
        {breadcrumb}
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{lesson.worldTitle}</Badge>
          <Badge variant="neutral">{AGE_BAND_LABELS[lesson.ageBand]}</Badge>
          <Badge variant="neutral">
            <Clock aria-hidden="true" />
            {lesson.estimatedMinutes} min
          </Badge>
          <Badge variant="neutral" className="capitalize">
            {lesson.difficulty}
          </Badge>
          {lesson.isSample ? <SampleBadge /> : null}
        </div>
        <h1 className="text-3xl font-semibold text-ink-900 sm:text-5xl">{lesson.title}</h1>
        {lesson.description ? <p className="text-xl text-ink-600">{lesson.description}</p> : null}
      </header>

      {lesson.learningObjectives.length > 0 ? (
        <Section id="objectives" icon={Target} title="What you will learn" tone="bg-electric-100 text-electric-700">
          <BulletList items={lesson.learningObjectives} marker="bg-electric-500" />
        </Section>
      ) : null}

      <LessonMediaPanel
        media={media}
        title={lesson.title}
        lessonId={lesson.id}
        trackProgress={trackProgress}
      />

      <Section id="transcript" icon={BookOpen} title="Read the lesson" tone="bg-nebula-100 text-nebula-700">
        {paragraphs.length > 0 ? (
          <div className="space-y-4 text-lg leading-relaxed text-ink-800">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="text-ink-500">The lesson text has not been written yet.</p>
        )}
        <p className="mt-4 text-sm text-ink-500">
          This text is also the transcript of the lesson video.
        </p>
      </Section>

      {lesson.keyTerms.length > 0 ? (
        <Section id="key-terms" icon={BookMarked} title="Key words" tone="bg-sun-100 text-sun-700">
          <dl className="grid gap-3 sm:grid-cols-2">
            {lesson.keyTerms.map((item) => (
              <div key={item.term} className="rounded-2xl bg-sun-50 p-4">
                <dt className="font-heading text-lg font-semibold text-ink-900">{item.term}</dt>
                <dd className="mt-1 text-ink-700">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}

      {lesson.advantages.length > 0 || lesson.limitations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {lesson.advantages.length > 0 ? (
            <Section id="advantages" icon={ThumbsUp} title="What AI is good at" tone="bg-aqua-100 text-aqua-700">
              <BulletList items={lesson.advantages} marker="bg-aqua-500" />
            </Section>
          ) : null}
          {lesson.limitations.length > 0 ? (
            <Section id="limitations" icon={ThumbsDown} title="Where AI falls short" tone="bg-coral-100 text-coral-700">
              <BulletList items={lesson.limitations} marker="bg-coral-500" />
            </Section>
          ) : null}
        </div>
      ) : null}

      {lesson.safetyNotes.length > 0 ? (
        <section
          aria-labelledby="safety"
          className="rounded-3xl bg-ink-900 p-5 text-white shadow-card sm:p-7"
        >
          <h2 id="safety" className="flex items-center gap-3 text-2xl font-semibold">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-aqua-500/20 text-aqua-300">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            Stay safe
          </h2>
          <ul className="mt-4 space-y-3">
            {lesson.safetyNotes.map((note) => (
              <li key={note} className="flex gap-3 text-lg text-ink-100">
                <ShieldCheck className="mt-1 size-5 shrink-0 text-aqua-300" aria-hidden="true" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {lesson.keyTakeaways.length > 0 ? (
        <Section id="takeaways" icon={Lightbulb} title="Remember this" tone="bg-sun-100 text-sun-700">
          <ol className="grid gap-3">
            {lesson.keyTakeaways.map((item, index) => (
              <li key={item} className="flex items-start gap-3 text-lg text-ink-800">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sun-400 font-heading text-base font-bold text-ink-900"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {footer}
    </article>
  )
}
