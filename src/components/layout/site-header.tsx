import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { MobileMenu, type MenuLink } from "@/components/navigation/mobile-menu"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"

const NAV_LINKS: MenuLink[] = [
  { href: "/#worlds", label: "Learning worlds" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#safety", label: "Safety" },
  { href: "/#parents", label: "For parents" },
]

const ACTIONS: MenuLink[] = [
  { href: routes.login, label: "Log in" },
  { href: routes.signup, label: "Get started" },
]

/** Public header. Static on purpose: it never reads the session. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/95 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between gap-4">
        <Logo tone="light" />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-sm font-bold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost-inverse" size="sm" className="hidden md:inline-flex">
            <Link href={routes.login}>Log in</Link>
          </Button>
          <Button asChild variant="playful" size="sm" className="hidden sm:inline-flex">
            <Link href={routes.signup}>Get started</Link>
          </Button>
          <MobileMenu links={NAV_LINKS} actions={ACTIONS} tone="dark" title="Main menu" />
        </div>
      </div>
    </header>
  )
}
