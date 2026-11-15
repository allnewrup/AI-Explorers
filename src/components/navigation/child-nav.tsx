"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarCheck, Compass, Crown, House, Trophy, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { routes } from "@/config/site"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  /** Path prefixes that also count as "inside" this section. */
  also?: string[]
  exact?: boolean
}

const ITEMS: NavItem[] = [
  { href: routes.child.dashboard, label: "Home", icon: House, exact: true },
  { href: routes.child.learn, label: "Learn", icon: Compass, also: ["/child/lessons"] },
  { href: routes.child.challenge, label: "Challenge", icon: CalendarCheck },
  { href: routes.child.progress, label: "Progress", icon: Trophy },
  { href: routes.child.leaderboard, label: "Leaders", icon: Crown },
]

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href
  return [item.href, ...(item.also ?? [])].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

/**
 * Child-area navigation. `top` is the desktop bar; `bottom` is the thumb-reach
 * tab bar shown on phones and tablets (below the `lg` breakpoint).
 */
export function ChildNav({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname()

  if (variant === "top") {
    return (
      <nav aria-label="Explorer" className="hidden items-center gap-1 lg:flex">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex h-11 items-center gap-1.5 rounded-xl px-3 font-heading font-semibold whitespace-nowrap transition-colors",
                active ? "bg-electric-100 text-electric-700" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav
      aria-label="Explorer"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold transition-colors",
                  active ? "text-electric-700" : "text-ink-500 hover:text-ink-900"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-electric-100"
                  )}
                >
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
