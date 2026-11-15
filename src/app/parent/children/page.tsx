import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { connection } from "next/server"
import { Info, UserPlus } from "lucide-react"
import { EmptyState } from "@/components/feedback/empty-state"
import { CardGridSkeleton } from "@/components/feedback/skeletons"
import { PageHeader } from "@/components/layout/page-header"
import { ChildManageCard, type ConsentSummary } from "@/components/profiles/child-manage-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { generateExplorerNameOptions } from "@/config/explorer-names"
import { MAX_CHILD_PROFILES } from "@/config/gamification"
import { CONSENT_LIMITATION_NOTICE } from "@/config/policy"
import { routes } from "@/config/site"
import { listConsentRecords, type ConsentRecord } from "@/features/profiles/queries"
import { listChildProfiles, requireProfile } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Explorers" }

const CONSENT_LABELS: Record<ConsentRecord["consentType"], string> = {
  terms_and_privacy: "Parent or guardian, privacy notice read",
  child_profile_data: "Storing the profile and learning progress",
  leaderboard_display: "Showing the explorer on the leaderboard",
}

export default function ChildrenPage() {
  return (
    <Suspense fallback={<CardGridSkeleton cards={2} />}>
      <ChildrenContent />
    </Suspense>
  )
}

async function ChildrenContent() {
  await requireProfile()
  const [children, consents] = await Promise.all([listChildProfiles(), listConsentRecords()])

  // Random name suggestions for the edit dialogs: generated per request.
  await connection()

  const canAdd = children.length < MAX_CHILD_PROFILES

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Explorers"
        description={`Manage your children's profiles. You can have up to ${MAX_CHILD_PROFILES}.`}
        actions={
          canAdd ? (
            <Button asChild>
              <Link href={routes.onboarding}>
                <UserPlus aria-hidden="true" />
                Add an explorer
              </Link>
            </Button>
          ) : null
        }
      />

      {children.length === 0 ? (
        <EmptyState
          mood="wave"
          title="No explorers yet"
          description="Create a profile for your child to start learning."
          action={
            <Button asChild variant="playful" size="lg">
              <Link href={routes.onboarding}>Set up an explorer</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {children.map((child) => {
            const summaries: ConsentSummary[] = consents
              .filter((consent) => consent.childProfileId === child.id)
              .map((consent) => ({
                id: consent.id,
                label: CONSENT_LABELS[consent.consentType],
                policyVersion: consent.policyVersion,
                status: consent.status,
                recordedAt: consent.recordedAt,
                revokedAt: consent.revokedAt,
              }))
            return (
              <ChildManageCard
                key={child.id}
                child={child}
                consents={summaries}
                nameSuggestions={generateExplorerNameOptions(6)}
              />
            )
          })}
        </div>
      )}

      <Alert variant="info">
        <Info aria-hidden="true" />
        <AlertTitle>About consent records</AlertTitle>
        <AlertDescription>
          <p>{CONSENT_LIMITATION_NOTICE}</p>
          <p className="mt-2">
            Deleting a profile removes its consent records along with everything else. Read the{" "}
            <Link href={routes.privacy}>privacy notice</Link> for details.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  )
}
