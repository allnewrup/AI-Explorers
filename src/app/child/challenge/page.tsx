import type { Metadata } from "next"
import { Suspense } from "react"
import { ArticleSkeleton } from "@/components/feedback/skeletons"
import { PageHeader } from "@/components/layout/page-header"
import { DailyChallengePlayer } from "@/components/quizzes/daily-challenge"
import { getDailyChallenge } from "@/features/gamification/queries"
import { requireActiveChild } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Daily challenge" }

export default function ChallengePage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ChallengeContent />
    </Suspense>
  )
}

async function ChallengeContent() {
  const child = await requireActiveChild()
  const challenge = await getDailyChallenge(child.id)

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <PageHeader
        title="Daily challenge"
        description="One question every day. Answer it to keep your streak going. A new question arrives at midnight (UTC)."
      />
      {/* key: reset the player's local state when the day's question changes */}
      <DailyChallengePlayer key={challenge.challenge_date} challenge={challenge} />
    </div>
  )
}
