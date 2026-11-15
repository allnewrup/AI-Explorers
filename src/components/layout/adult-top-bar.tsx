import { Suspense } from "react"
import { LogOut } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { NavLinks, type NavLinkItem } from "@/components/navigation/nav-links"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/features/authentication/actions"

/** Top bar for the parent and admin areas. */
export function AdultTopBar({
  home,
  areaLabel,
  links,
  identity,
}: {
  home: string
  areaLabel: string
  links: NavLinkItem[]
  /** Streams in: the signed-in adult's name and any role-specific links. */
  identity?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex min-h-18 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2">
        <div className="flex items-center gap-3">
          <Logo href={home} />
          <Badge variant="neutral" className="hidden sm:inline-flex">
            {areaLabel}
          </Badge>
        </div>
        <div className="order-3 w-full md:order-2 md:w-auto">
          <Suspense fallback={null}>
            <NavLinks items={links} label={areaLabel} />
          </Suspense>
        </div>
        <div className="order-2 flex items-center gap-2 md:order-3">
          {identity}
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
