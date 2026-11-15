"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ErrorState } from "@/components/feedback/error-state"
import { Button } from "@/components/ui/button"

/**
 * Route-level error boundary. The message shown is deliberately generic:
 * error details can contain internal information and are only logged.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main-content" className="flex flex-1 items-center justify-center bg-mist px-4 py-16">
      <ErrorState
        description={
          <>
            <p>Something went wrong while loading this page. It is not your fault.</p>
            {error.digest ? (
              <p className="mt-2 text-xs text-ink-400">Reference: {error.digest}</p>
            ) : null}
          </>
        }
        action={
          <>
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/">Go to the home page</Link>
            </Button>
          </>
        }
      />
    </main>
  )
}
