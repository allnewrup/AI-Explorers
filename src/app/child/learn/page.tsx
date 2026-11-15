import type { Metadata } from "next"
import { Suspense } from "react"
import { EmptyState } from "@/components/feedback/empty-state"
import { CardGridSkeleton } from "@/components/feedback/skeletons"
import { PageHeader } from "@/components/layout/page-header"
import { WorldCard } from "@/components/lessons/cards"
import { listWorldsWithProgress } from "@/features/curriculum/queries"
import { requireActiveChild } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Learning worlds" }

export default function LearnPage() {
  return (
    <Suspense fallback={<CardGridSkeleton cards={6} />}>
      <LearnContent />
    </Suspense>
  )
}

async function LearnContent() {
  const child = await requireActiveChild()
  const worlds = await listWorldsWithProgress(child.id)

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Learning worlds"
        description="Pick a world to explore. Each one is full of short lessons and quizzes."
      />
      {worlds.length > 0 ? (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world) => (
            <li key={world.id}>
              <WorldCard world={world} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No worlds to explore yet"
          description="Learning worlds will appear here as soon as they are published."
        />
      )}
    </div>
  )
}
