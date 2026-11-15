import { Suspense } from "react"
import Link from "next/link"
import { SetupRequired } from "@/components/feedback/setup-required"
import { AdultTopBar } from "@/components/layout/adult-top-bar"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/config/env"
import { routes } from "@/config/site"
import { getProfile } from "@/lib/auth/session"

const LINKS = [
  { href: routes.parent.dashboard, label: "Dashboard", exact: true },
  { href: routes.parent.children, label: "Explorers" },
]

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SetupRequired area="The parent area" />

  return (
    <div className="flex min-h-full flex-1 flex-col bg-mist">
      <AdultTopBar
        home={routes.parent.dashboard}
        areaLabel="Parent area"
        links={LINKS}
        identity={
          <Suspense fallback={null}>
            <AdminShortcut />
          </Suspense>
        }
      />
      <main id="main-content" className="container-page flex-1 py-8">
        {children}
      </main>
    </div>
  )
}

/** Shown only to administrators. The admin pages enforce access themselves. */
async function AdminShortcut() {
  const profile = await getProfile()
  if (profile?.role !== "admin") return null
  return (
    <Button asChild variant="secondary" size="sm">
      <Link href={routes.admin.dashboard}>Admin</Link>
    </Button>
  )
}
