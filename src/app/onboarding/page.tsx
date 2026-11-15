import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { connection } from "next/server"
import { Logo } from "@/components/brand/logo"
import { EmptyState } from "@/components/feedback/empty-state"
import { SetupRequired } from "@/components/feedback/setup-required"
import { FormSkeleton } from "@/components/feedback/skeletons"
import { Spark } from "@/components/mascot/spark"
import { OnboardingForm } from "@/components/profiles/onboarding-form"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/config/env"
import { generateExplorerNameOptions } from "@/config/explorer-names"
import { MAX_CHILD_PROFILES } from "@/config/gamification"
import { routes } from "@/config/site"
import { signOutAction } from "@/features/authentication/actions"
import { listChildProfiles, requireProfile } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Set up an explorer profile" }

export default function OnboardingPage() {
  if (!isSupabaseConfigured()) return <SetupRequired area="Setting up a profile" />

  return (
    <div className="flex flex-1 flex-col bg-mist">
      <header className="border-b border-ink-200 bg-white">
        <div className="container-page flex h-18 items-center justify-between">
          <Logo href={routes.parent.dashboard} />
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main id="main-content" className="container-page max-w-4xl flex-1 py-10">
        <Suspense fallback={<FormSkeleton fields={4} />}>
          <OnboardingContent />
        </Suspense>
      </main>
    </div>
  )
}

async function OnboardingContent() {
  const profile = await requireProfile()
  const children = await listChildProfiles()

  if (children.length >= MAX_CHILD_PROFILES) {
    return (
      <EmptyState
        mood="happy"
        title="Your crew is full"
        description={`You already have ${MAX_CHILD_PROFILES} explorer profiles, which is the most one account can hold.`}
        action={
          <Button asChild>
            <Link href={routes.parent.children}>Manage explorers</Link>
          </Button>
        }
      />
    )
  }

  // Name suggestions are random, so they must be generated per request.
  await connection()
  const initialNames = generateExplorerNameOptions(6)

  return (
    <div className="grid gap-8">
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <Spark mood="wave" size={120} />
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {children.length === 0
              ? `Welcome, ${profile.displayName}!`
              : "Add another explorer"}
          </h1>
          <p className="mt-2 text-lg text-ink-500">
            {children.length === 0
              ? "Let's set up a profile for your child. It takes about a minute."
              : "Each child gets their own profile, progress and XP."}
          </p>
        </div>
      </div>

      <div className="rounded-4xl bg-white p-6 shadow-soft ring-1 ring-ink-900/5 sm:p-8">
        <OnboardingForm initialNames={initialNames} />
      </div>
    </div>
  )
}
