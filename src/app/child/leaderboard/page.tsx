import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { EyeOff, Info } from "lucide-react"
import { EmptyState } from "@/components/feedback/empty-state"
import { TableSkeleton } from "@/components/feedback/skeletons"
import { LeaderboardList } from "@/components/gamification/leaderboard-list"
import { PageHeader } from "@/components/layout/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AGE_BAND_LABELS } from "@/config/age-bands"
import { routes } from "@/config/site"
import { getWeeklyLeaderboard } from "@/features/gamification/queries"
import { requireActiveChild } from "@/lib/auth/session"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Leaderboard" }

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={8} />}>
      <LeaderboardContent />
    </Suspense>
  )
}

async function LeaderboardContent() {
  const child = await requireActiveChild()
  const board = await getWeeklyLeaderboard(child.id, 20)

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <PageHeader
        title="Weekly leaderboard"
        description={`Explorers in ${AGE_BAND_LABELS[child.ageBand].toLowerCase()} ranked by XP earned since ${formatDate(board.week_start)}. It starts fresh every Monday.`}
      />

      {board.self.visible_to_others ? (
        <Alert variant="info">
          <Info aria-hidden="true" />
          <AlertTitle>You are on the board</AlertTitle>
          <AlertDescription>
            Other explorers can see your explorer name, avatar and weekly XP. A parent can switch
            this off at any time.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="info">
          <EyeOff aria-hidden="true" />
          <AlertTitle>Only you can see your place</AlertTitle>
          <AlertDescription>
            Your name is hidden from other families. A parent can choose to show it from the
            Explorers page.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-ink-900/5">
        <p className="font-heading text-lg font-semibold text-ink-900">
          {board.self.rank === null
            ? "You have not earned XP this week yet."
            : `You are number ${board.self.rank} with ${board.self.weekly_xp} XP this week.`}
        </p>
      </div>

      {board.entries.length > 0 ? (
        <LeaderboardList entries={board.entries} />
      ) : (
        <EmptyState
          title="The board is empty"
          description="Nobody has earned XP yet this week. Finish a lesson or a quiz to be the first."
          action={
            <Button asChild>
              <Link href={routes.child.learn}>Find a lesson</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
