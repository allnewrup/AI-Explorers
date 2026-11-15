import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import {
  BookOpen,
  CircleHelp,
  FilePen,
  Globe,
  Plus,
  Users,
  VideoOff,
} from "lucide-react"
import { DashboardSkeleton } from "@/components/feedback/skeletons"
import { StatTile } from "@/components/gamification/stats"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { getContentOverview } from "@/features/admin-content/queries"
import { requireAdmin } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Admin overview" }

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminOverview />
    </Suspense>
  )
}

async function AdminOverview() {
  const profile = await requireAdmin()
  const overview = await getContentOverview()

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Content overview"
        description={`Signed in as ${profile.displayName}. Manage lessons, quizzes and learning worlds.`}
        actions={
          <Button asChild>
            <Link href={routes.admin.newLesson}>
              <Plus aria-hidden="true" />
              New lesson
            </Link>
          </Button>
        }
      />

      <section aria-labelledby="content-heading" className="grid gap-4">
        <h2 id="content-heading" className="text-2xl font-semibold">
          Content
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={<BookOpen aria-hidden="true" />}
            label="Published lessons"
            value={overview.lessons_published}
            hint={`${overview.lessons_total} in total · ${overview.lessons_sample} sample`}
            tone="aqua"
          />
          <StatTile
            icon={<FilePen aria-hidden="true" />}
            label="Drafts"
            value={overview.lessons_draft}
            hint={`${overview.lessons_archived} archived`}
            tone="sun"
          />
          <StatTile
            icon={<CircleHelp aria-hidden="true" />}
            label="Quiz questions"
            value={overview.questions_total}
            hint={`across ${overview.quizzes_total} quizzes`}
            tone="nebula"
          />
          <StatTile
            icon={<Globe aria-hidden="true" />}
            label="Active worlds"
            value={overview.worlds_active}
            hint={`${overview.worlds_total} in total`}
            tone="electric"
          />
        </div>
        {overview.lessons_without_video > 0 ? (
          <p className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-ink-700 shadow-soft ring-1 ring-ink-900/5">
            <VideoOff className="size-4 shrink-0 text-ink-500" aria-hidden="true" />
            {overview.lessons_without_video} published{" "}
            {overview.lessons_without_video === 1 ? "lesson has" : "lessons have"} no video yet.
            Children see a “video coming soon” panel and the written lesson.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="usage-heading" className="grid gap-4">
        <div>
          <h2 id="usage-heading" className="text-2xl font-semibold">
            Usage totals
          </h2>
          <p className="text-sm text-ink-500">
            Whole-platform counts only. Administrators cannot view individual children&apos;s
            records.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile icon={<Users aria-hidden="true" />} label="Parent accounts" value={overview.families_total} />
          <StatTile icon={<Users aria-hidden="true" />} label="Explorer profiles" value={overview.child_profiles_total} tone="nebula" />
          <StatTile icon={<BookOpen aria-hidden="true" />} label="Lessons completed" value={overview.lessons_completed_total} tone="aqua" />
          <StatTile icon={<CircleHelp aria-hidden="true" />} label="Quiz attempts" value={overview.quiz_attempts_total} tone="sun" />
        </div>
      </section>

      <section aria-label="Shortcuts" className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={routes.admin.lessons}>Manage lessons</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={routes.admin.worlds}>Manage worlds</Link>
        </Button>
      </section>
    </div>
  )
}
