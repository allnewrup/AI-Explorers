import Link from "next/link"
import { Database, KeyRound, Terminal } from "lucide-react"
import { Logo } from "@/components/brand/logo"
import { Spark } from "@/components/mascot/spark"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const STEPS = [
  {
    icon: Database,
    title: "Create a Supabase project",
    body: "Then apply the SQL in supabase/migrations and supabase/seed.sql.",
  },
  {
    icon: KeyRound,
    title: "Add the project keys",
    body: "Copy .env.example to .env.local and fill in the project URL and anon key.",
  },
  {
    icon: Terminal,
    title: "Restart the app",
    body: "Stop and start the dev server (or redeploy) so the new settings load.",
  },
] as const

/**
 * Rendered instead of any page that needs accounts or data when the Supabase
 * environment variables are missing. The app has no mock backend: if it is not
 * connected, it says so.
 */
export function SetupRequired({ area = "This part of AI Explorers" }: { area?: string }) {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center bg-mist px-4 py-12"
    >
      <div className="w-full max-w-2xl rounded-4xl bg-white p-6 shadow-card ring-1 ring-ink-900/5 sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <Logo />
          <Badge variant="sun">Setup needed</Badge>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Spark mood="thinking" size={120} />
          <div>
            <h1 className="text-3xl font-semibold">Supabase is not configured</h1>
            <p className="mt-2 text-ink-500">
              {area} needs a database and sign-in service. This deployment has not been connected
              to one yet, so accounts, lessons and progress are unavailable. Nothing here is
              simulated.
            </p>
          </div>
        </div>

        <ol className="mt-8 grid gap-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-2xl bg-mist p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-electric-100 text-electric-700">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading font-semibold text-ink-900">
                  {index + 1}. {step.title}
                </p>
                <p className="text-sm text-ink-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-sm text-ink-500">
          Full instructions are in <code className="rounded bg-ink-100 px-1.5 py-0.5">README.md</code>{" "}
          at the root of the project.
        </p>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/">Back to the home page</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
