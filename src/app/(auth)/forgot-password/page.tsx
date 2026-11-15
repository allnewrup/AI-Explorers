import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { ForgotPasswordForm } from "@/components/auth/auth-forms"
import { routes } from "@/config/site"

export const metadata: Metadata = { title: "Reset your password" }

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter the email address you signed up with and we will send you a link to choose a new password."
      mood="thinking"
      footer={
        <p>
          Remembered it?{" "}
          <Link href={routes.login} className="font-bold text-electric-700 underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  )
}
