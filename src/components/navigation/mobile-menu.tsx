"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export type MenuLink = { href: string; label: string }

/**
 * Slide-in navigation for small screens. Built on a dialog primitive, so focus
 * is trapped while open, Escape closes it, and focus returns to the trigger.
 */
export function MobileMenu({
  links,
  actions,
  tone = "light",
  title = "Menu",
}: {
  links: MenuLink[]
  actions?: MenuLink[]
  tone?: "light" | "dark"
  title?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant={tone === "dark" ? "ghost-inverse" : "ghost"}
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] gap-0 bg-white p-0">
        <SheetHeader className="border-b border-ink-100 p-5">
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          <Logo href={null} />
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 font-heading text-lg font-semibold text-ink-800 hover:bg-electric-50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        {actions && actions.length > 0 ? (
          <div className="mt-auto grid gap-3 border-t border-ink-100 p-5">
            {actions.map((action, index) => (
              <Button
                key={action.href}
                asChild
                size="lg"
                variant={index === actions.length - 1 ? "default" : "outline"}
              >
                <Link href={action.href} onClick={() => setOpen(false)}>
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
