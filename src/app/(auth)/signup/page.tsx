import type { Metadata } from "next"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"
import { SignUpForm } from "@/components/auth/auth-forms"
import { routes } from "@/config/site"

export const metadata: Metadata = { title: "Create a parent account" }

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create a parent account"
      description="This account is for a parent or guardian. You will set up your child's explorer profile in the next step."
      footer={
        <p>
          Already have an account?{" "}
          <Link href={routes.login} className="font-bold text-electric-700 underline underline-offset-4">
            Log in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  )
}
