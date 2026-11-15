import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/auth-forms"
import { FormSkeleton } from "@/components/feedback/skeletons"
import { routes } from "@/config/site"

export const metadata: Metadata = { title: "Log in" }

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to your parent account."
      footer={
        <p>
          New to AI Explorers?{" "}
          <Link href={routes.signup} className="font-bold text-electric-700 underline underline-offset-4">
            Create a parent account
          </Link>
        </p>
      }
    >
      {/* The form reads ?next= and ?notice= from the URL, which is request data. */}
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
