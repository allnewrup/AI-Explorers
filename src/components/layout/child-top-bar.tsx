import { Suspense } from "react"
import Link from "next/link"
import { UserRound } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { AvatarDisc } from "@/components/gamification/avatar-disc"
import { StreakBadge, XpPill } from "@/components/gamification/stats"
import { ChildNav } from "@/components/navigation/child-nav"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"

/** Presentational: everything it shows is passed in. */
export function ChildIdentity({
  displayName,
  avatarKey,
  totalXp,
  streak,
}: {
  displayName: string
  avatarKey: string
  totalXp: number
  streak: number
}) {
  return (
    <div className="flex items-center gap-2">
      <StreakBadge days={streak} className="hidden sm:inline-flex lg:hidden xl:inline-flex" />
      <XpPill totalXp={totalXp} />
      <span className="flex items-center gap-2">
        <AvatarDisc avatarKey={avatarKey} size="sm" />
        <span className="hidden max-w-40 truncate font-heading font-semibold text-ink-900 xl:inline">
          {displayName}
        </span>
        <span className="sr-only xl:hidden">{displayName}</span>
      </span>
    </div>
  )
}

export function ChildTopBar({ identity }: { identity: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Logo href={routes.child.dashboard} />
          {/* usePathname() needs a boundary on routes with dynamic segments. */}
          <Suspense fallback={null}>
            <ChildNav variant="top" />
          </Suspense>
        </div>
        <div className="flex items-center gap-2">
          {identity}
          <Button asChild variant="ghost" size="sm" className="px-3">
            <Link href={routes.parent.dashboard}>
              <UserRound aria-hidden="true" />
              <span className="sr-only sm:not-sr-only lg:sr-only xl:not-sr-only">Parent area</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
