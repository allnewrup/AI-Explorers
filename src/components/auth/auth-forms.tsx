"use client"

import { useActionState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Info } from "lucide-react"
import { Field, FieldError, FormAlert, SubmitButton, fieldAria } from "@/components/feedback/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { routes } from "@/config/site"
import {
  requestPasswordResetAction,
  signInAction,
  signUpAction,
  updatePasswordAction,
} from "@/features/authentication/actions"
import { idleFormState } from "@/lib/action-result"

const NOTICES: Record<string, string> = {
  "link-invalid":
    "That link is no longer valid. It may have expired or already been used. Please try again.",
  "signed-out": "You have been signed out.",
}

export function LoginForm() {
  const [state, action] = useActionState(signInAction, idleFormState)
  const searchParams = useSearchParams()
  const notice = NOTICES[searchParams.get("notice") ?? ""]
  const next = searchParams.get("next") ?? ""

  return (
    <form action={action} noValidate className="grid gap-5">
      {notice && state.status === "idle" ? (
        <Alert variant="info">
          <Info aria-hidden="true" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <FormAlert state={state} />
      <input type="hidden" name="next" value={next} />

      <Field name="email" label="Email address" errors={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values?.email ?? ""}
          {...fieldAria("email", state.fieldErrors?.email)}
        />
      </Field>

      <Field name="password" label="Password" errors={state.fieldErrors?.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          {...fieldAria("password", state.fieldErrors?.password)}
        />
      </Field>

      <div className="flex justify-end">
        <Link
          href={routes.forgotPassword}
          className="rounded text-sm font-bold text-electric-700 underline-offset-4 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>

      <SubmitButton size="lg" pendingLabel="Logging in…">
        Log in
      </SubmitButton>
    </form>
  )
}

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, idleFormState)

  if (state.status === "success") {
    return <FormAlert state={state} />
  }

  return (
    <form action={action} noValidate className="grid gap-5">
      <FormAlert state={state} />

      <Field
        name="displayName"
        label="Your name"
        hint="What should we call you? This is the parent's name, not a child's."
        errors={state.fieldErrors?.displayName}
      >
        <Input
          id="displayName"
          name="displayName"
          autoComplete="name"
          required
          maxLength={60}
          defaultValue={state.values?.displayName ?? ""}
          {...fieldAria("displayName", state.fieldErrors?.displayName, true)}
        />
      </Field>

      <Field name="email" label="Email address" errors={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values?.email ?? ""}
          {...fieldAria("email", state.fieldErrors?.email)}
        />
      </Field>

      <Field
        name="password"
        label="Password"
        hint="At least 10 characters, with a letter and a number."
        errors={state.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          {...fieldAria("password", state.fieldErrors?.password, true)}
        />
      </Field>

      <div className="grid gap-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            className="mt-0.5"
            {...fieldAria("acceptTerms", state.fieldErrors?.acceptTerms)}
          />
          <label htmlFor="acceptTerms" className="text-sm leading-relaxed text-ink-700">
            I am an adult (18 or over) creating this account as a parent or guardian, and I have
            read the{" "}
            <Link
              href={routes.privacy}
              target="_blank"
              className="font-bold text-electric-700 underline underline-offset-4"
            >
              privacy notice
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
            .
          </label>
        </div>
        <FieldError name="acceptTerms" messages={state.fieldErrors?.acceptTerms} />
      </div>

      <SubmitButton size="lg" pendingLabel="Creating your account…">
        Create parent account
      </SubmitButton>
    </form>
  )
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, idleFormState)

  if (state.status === "success") {
    return <FormAlert state={state} />
  }

  return (
    <form action={action} noValidate className="grid gap-5">
      <FormAlert state={state} />
      <Field name="email" label="Email address" errors={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          defaultValue={state.values?.email ?? ""}
          {...fieldAria("email", state.fieldErrors?.email)}
        />
      </Field>
      <SubmitButton size="lg" pendingLabel="Sending…">
        Send reset link
      </SubmitButton>
    </form>
  )
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, idleFormState)

  return (
    <form action={action} noValidate className="grid gap-5">
      <FormAlert state={state} />
      <Field
        name="password"
        label="New password"
        hint="At least 10 characters, with a letter and a number."
        errors={state.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          {...fieldAria("password", state.fieldErrors?.password, true)}
        />
      </Field>
      <Field
        name="confirmPassword"
        label="Type the new password again"
        errors={state.fieldErrors?.confirmPassword}
      >
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          {...fieldAria("confirmPassword", state.fieldErrors?.confirmPassword)}
        />
      </Field>
      <SubmitButton size="lg" pendingLabel="Saving…">
        Save new password
      </SubmitButton>
    </form>
  )
}
