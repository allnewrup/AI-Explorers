"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

export type NavLinkItem = { href: string; label: string; exact?: boolean }

/** Horizontal section links with the current section marked. */
export function NavLinks({ items, label }: { items: NavLinkItem[]; label: string }) {
  const pathname = usePathname()
  return (
    <nav aria-label={label} className="flex items-center gap-1 overflow-x-auto">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center rounded-xl px-3.5 font-heading font-semibold transition-colors",
              active ? "bg-electric-100 text-electric-700" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
