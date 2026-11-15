import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1.5 rounded font-heading font-semibold text-electric-700 underline-offset-4 hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Link>
  )
}
