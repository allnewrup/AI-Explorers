import Link from "next/link"
import { cn } from "cn"
import { SparkMark } from "@/components/mascot/spark"
import { siteConfig } from "@/config/site"

export function Logo({
  href = "/",
  tone = "dark",
  className,
}: {
  href?: string | null
  tone?: "dark" | "light"
  className?: string
}) {
  const content = (
    <>
      <SparkMark size={38} />
      <span
        className={cn(
          "font-heading text-xl leading-none font-bold tracking-tight",
          tone === "dark" ? "text-ink-900" : "text-white"
        )}
      >
        AI <span className={tone === "dark" ? "text-electric-600" : "text-sun-400"}>Explorers</span>
      </span>
    </>
  )

  if (href === null) {
    return <span className={cn("inline-flex items-center gap-2.5", className)}>{content}</span>
  }

  return (
    <Link
      href={href}
      aria-label={`${siteConfig.name} home`}
      className={cn("inline-flex items-center gap-2.5 rounded-xl", className)}
    >
      {content}
    </Link>
  )
}
