import { Skeleton } from "@/components/ui/skeleton"

/** Loading placeholders. Each announces itself once to screen readers. */

function Loading({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <Loading label="Loading form">
      <div className="grid gap-5">
        {Array.from({ length: fields }, (_, index) => (
          <div key={index} className="grid gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
        <Skeleton className="h-12 w-full" />
      </div>
    </Loading>
  )
}

export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <Loading label="Loading">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 max-w-full" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }, (_, index) => (
            <Skeleton key={index} className="h-64 rounded-3xl" />
          ))}
        </div>
      </div>
    </Loading>
  )
}

export function DashboardSkeleton() {
  return (
    <Loading label="Loading your dashboard">
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-4xl" />
        <div className="grid gap-5 md:grid-cols-3">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </Loading>
  )
}

export function ArticleSkeleton() {
  return (
    <Loading label="Loading lesson">
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-40 rounded-3xl" />
      </div>
    </Loading>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Loading label="Loading">
      <div className="space-y-3">
        <Skeleton className="h-9 w-56" />
        {Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl" />
        ))}
      </div>
    </Loading>
  )
}

export function TopBarSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <Skeleton className="h-10 w-20 rounded-full" />
      <Skeleton className="h-10 w-24 rounded-full" />
      <Skeleton className="size-10 rounded-xl" />
    </div>
  )
}
