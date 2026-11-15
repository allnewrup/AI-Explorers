import { Suspense } from "react"
import Link from "next/link"
import { SetupRequired } from "@/components/feedback/setup-required"
import { DashboardSkeleton } from "@/components/feedback/skeletons"
import { AdultTopBar } from "@/components/layout/adult-top-bar"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/config/env"
import { routes } from "@/config/site"
import { requireAdmin } from "@/lib/auth/session"

const LINKS = [
  { href: routes.admin.dashboard, label: "Overview", exact: true },
  { href: routes.admin.lessons, label: "Lessons" },
  { href: routes.admin.worlds, label: "Worlds" },
]

/**
 * Admin shell.
 *
 * The whole shell sits behind `AdminGate`, so a signed-in parent who guesses
 * the URL gets the ordinary "not found" page rather than admin chrome. This is
 * a courtesy, not the control: every admin page calls requireAdmin() itself,
 * every admin action re-checks the role, and the database functions refuse
 * non-administrators regardless.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupRequired area="The admin area" />

  return (
    <Suspense
      fallback={
        <div className="container-page flex-1 py-8">
          <DashboardSkeleton />
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  )
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="flex min-h-full flex-1 flex-col bg-mist">
      <AdultTopBar
        home={routes.admin.dashboard}
        areaLabel="Admin"
        links={LINKS}
        identity={
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href={routes.parent.dashboard}>Parent area</Link>
          </Button>
        }
      />
      <main id="main-content" className="container-page flex-1 py-8">
        {children}
      </main>
    </div>
  )
}
