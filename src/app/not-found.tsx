import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { Spark } from "@/components/mascot/spark"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center gap-6 bg-mist px-4 py-16 text-center"
    >
      <Logo />
      <Spark mood="thinking" size={160} />
      <div>
        <h1 className="text-4xl font-semibold text-ink-900">We could not find that page</h1>
        <p className="mt-3 max-w-md text-lg text-ink-500">
          It may have moved, or it may not be available to you. Let&apos;s get you back on course.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">Go to the home page</Link>
      </Button>
    </main>
  )
}
