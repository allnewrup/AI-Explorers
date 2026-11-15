import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { routes, siteConfig } from "@/config/site"

const GROUPS = [
  {
    title: "Explore",
    links: [
      { href: "/#worlds", label: "Learning worlds" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#daily", label: "Daily learning" },
    ],
  },
  {
    title: "Families",
    links: [
      { href: "/#safety", label: "Safety" },
      { href: "/#parents", label: "For parents" },
      { href: routes.privacy, label: "Privacy notice" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: routes.signup, label: "Create a parent account" },
      { href: routes.login, label: "Log in" },
    ],
  },
] as const

export function SiteFooter() {
  return (
    <footer className="bg-ink-950 text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-xs text-sm leading-relaxed text-ink-300">{siteConfig.tagline}</p>
          <p className="max-w-xs text-sm leading-relaxed text-ink-300">
            An early version. Lessons are sample content and have not yet been reviewed by
            educators.
          </p>
        </div>
        {GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="font-heading text-base font-semibold text-white">{group.title}</h2>
            <ul className="mt-4 space-y-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded text-sm text-ink-300 underline-offset-4 hover:text-white hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-ink-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {siteConfig.name}. Made for curious minds.</p>
          <p>Children use {siteConfig.name} through a parent&apos;s account.</p>
        </div>
      </div>
    </footer>
  )
}
