import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { ResetPasswordForm } from "@/components/auth/auth-forms"
import { FormSkeleton } from "@/components/feedback/skeletons"
import { Button } from "@/components/ui/button"
import { routes } from "@/config/site"
import { getSessionUser } from "@/lib/auth/session"

export const metadata: Metadata = { title: "Choose a new password" }

export default function ResetPasswordPage() {
  return (
    <AuthCard title="Choose a new password" mood="happy">
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <ResetPasswordContent />
      </Suspense>
    </AuthCard>
  )
}

/**
 * The reset e-mail link signs the user in (via /auth/confirm) before landing
 * here. Without that session there is nobody whose password could be changed.
 */
async function ResetPasswordContent() {
  const user = await getSessionUser()

  if (!user) {
    return (
      <div className="grid gap-4">
        <p className="text-ink-700">
          This page only works from the link in a password reset email, and that link has expired
          or was opened in a different browser.
        </p>
        <Button asChild>
          <Link href={routes.forgotPassword}>Request a new link</Link>
        </Button>
      </div>
    )
  }

  return <ResetPasswordForm />
}
