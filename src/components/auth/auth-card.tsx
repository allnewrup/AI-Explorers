import { Logo } from "@/components/brand/logo"
import { Spark, type SparkMood } from "@/components/mascot/spark"
import { siteConfig } from "@/config/site"

export function AuthCard({
  title,
  description,
  mood = "wave",
  children,
  footer,
}: {
  title: string
  description?: React.ReactNode
  mood?: SparkMood
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main
      id="main-content"
      className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-ink-900 px-4 py-10"
    >
      <div className="bg-starfield absolute inset-0 -z-10" aria-hidden="true" />
      <div
        className="absolute -top-32 -right-24 -z-10 size-96 rounded-full bg-electric-500/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-24 -z-10 size-96 rounded-full bg-nebula-500/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden flex-col items-start gap-6 text-white lg:flex">
          <Logo tone="light" />
          <Spark mood={mood} size={220} floating />
          <p className="max-w-sm font-heading text-3xl leading-tight font-semibold">
            {siteConfig.tagline}
          </p>
          <p className="max-w-sm text-ink-200">
            Accounts belong to parents. Children learn inside a profile that a parent sets up and
            can remove at any time.
          </p>
        </div>

        <div className="w-full rounded-4xl bg-white p-6 shadow-lift sm:p-10">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description ? <p className="mt-2 text-ink-500">{description}</p> : null}
          <div className="mt-6">{children}</div>
          {footer ? (
            <div className="mt-6 border-t border-ink-100 pt-6 text-sm text-ink-500">{footer}</div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
