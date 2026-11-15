import { Suspense } from "react"
import { SetupRequired } from "@/components/feedback/setup-required"
import { TopBarSkeleton } from "@/components/feedback/skeletons"
import { ChildIdentity, ChildTopBar } from "@/components/layout/child-top-bar"
import { ChildNav } from "@/components/navigation/child-nav"
import { isSupabaseConfigured } from "@/config/env"
import { getChildSummary } from "@/features/gamification/queries"
import { requireActiveChild } from "@/lib/auth/session"

/**
 * Shell for the explorer (child) area.
 *
 * The chrome is static; the part that depends on who is signed in streams in
 * behind a Suspense boundary. Each page below re-checks the session and the
 * active child itself: the layout is not relied on as a guard.
 */
export default function ChildLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupRequired area="The explorer area" />

  return (
    <div className="flex min-h-full flex-1 flex-col bg-mist">
      <ChildTopBar
        identity={
          <Suspense fallback={<TopBarSkeleton />}>
            <ActiveChildIdentity />
          </Suspense>
        }
      />
      <main id="main-content" className="container-page flex-1 py-6 pb-28 sm:py-8 md:pb-12">
        {children}
      </main>
      <Suspense fallback={null}>
        <ChildNav variant="bottom" />
      </Suspense>
    </div>
  )
}

async function ActiveChildIdentity() {
  const child = await requireActiveChild()
  const summary = await getChildSummary(child.id)
  return (
    <ChildIdentity
      displayName={child.displayName}
      avatarKey={child.avatarKey}
      totalXp={summary.total_xp}
      streak={summary.current_streak}
    />
  )
}
