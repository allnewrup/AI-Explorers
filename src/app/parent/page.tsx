import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ParentReportView } from "@/components/dashboards/parent-report-view"
import { EmptyState } from "@/components/feedback/empty-state"
import { SubmitButton } from "@/components/feedback/form"
import { DashboardSkeleton } from "@/components/feedback/skeletons"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { getChildReport } from "@/features/analytics/queries"
import { selectActiveChildAction } from "@/features/profiles/actions"
import { listChildProfiles, requireProfile } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Parent dashboard" }

export default function ParentDashboardPage({ searchParams }: PageProps<"/parent">) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ParentDashboard searchParams={searchParams} />
    </Suspense>
  )
}

async function ParentDashboard({ searchParams }: Pick<PageProps<"/parent">, "searchParams">) {
  const profile = await requireProfile()
  const children = await listChildProfiles()

  if (children.length === 0) {
    return (
      <EmptyState
        mood="wave"
        title={`Welcome, ${profile.displayName}!`}
        description="You have not set up an explorer profile yet. Create one for your child to start learning."
        action={
          <Button asChild size="lg" variant="playful">
            <Link href={routes.onboarding}>
              Set up an explorer
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        }
      />
    )
  }

  // ?child= only chooses among this parent's own children, which were already
  // filtered by row-level security. An unknown id falls back to the first.
  const requested = (await searchParams).child
  const selected =
    children.find((child) => child.id === (typeof requested === "string" ? requested : "")) ??
    children[0]
  if (!selected) return null

  const report = await getChildReport(selected.id)

  return (
    <ParentReportView
      parentName={profile.displayName}
      childProfiles={children}
      selected={selected}
      report={report}
      startLearningForm={
        selected.isActive ? (
          <form action={selectActiveChildAction}>
            <input type="hidden" name="childId" value={selected.id} />
            <SubmitButton variant="playful" size="lg" pendingLabel="Opening…">
              Learn as {selected.displayName}
              <ArrowRight aria-hidden="true" />
            </SubmitButton>
          </form>
        ) : (
          <Button asChild variant="outline">
            <Link href={routes.parent.children}>Resume this profile</Link>
          </Button>
        )
      }
    />
  )
}
