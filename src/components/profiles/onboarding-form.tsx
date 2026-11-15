"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Info } from "lucide-react"
import { FieldError, FormAlert, SubmitButton } from "@/components/feedback/form"
import { ChildProfileFields } from "@/components/profiles/child-profile-fields"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { CONSENT_LIMITATION_NOTICE, CONSENT_STATEMENTS } from "@/config/policy"
import { routes } from "@/config/site"
import { createChildProfileAction } from "@/features/profiles/actions"
import { idleFormState } from "@/lib/action-result"

function ConsentCheckbox({
  name,
  children,
  errors,
}: {
  name: string
  children: React.ReactNode
  errors?: string[] | undefined
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-start gap-3">
        <Checkbox
          id={name}
          name={name}
          className="mt-0.5"
          aria-invalid={errors && errors.length > 0 ? true : undefined}
          aria-describedby={errors && errors.length > 0 ? `${name}-error` : undefined}
        />
        <label htmlFor={name} className="text-sm leading-relaxed text-ink-800">
          {children}
        </label>
      </div>
      <FieldError name={name} messages={errors} />
    </div>
  )
}

export function OnboardingForm({ initialNames }: { initialNames: string[] }) {
  const [state, action] = useActionState(createChildProfileAction, idleFormState)

  return (
    <form action={action} noValidate className="grid gap-8">
      <FormAlert state={state} />

      <ChildProfileFields
        initialNames={initialNames}
        defaults={state.values}
        errors={state.fieldErrors}
      />

      <section aria-labelledby="consent-heading" className="grid gap-4 rounded-3xl bg-mist p-5 sm:p-6">
        <div>
          <h2 id="consent-heading" className="text-xl font-semibold">
            Privacy and consent
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Please read the{" "}
            <Link
              href={routes.privacy}
              target="_blank"
              className="font-bold text-electric-700 underline underline-offset-4"
            >
              privacy notice
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>{" "}
            before continuing. In short: we store the explorer name, avatar, age band and learning
            progress, and nothing that identifies your child in the real world.
          </p>
        </div>

        <ConsentCheckbox name="consentTerms" errors={state.fieldErrors?.consentTerms}>
          {CONSENT_STATEMENTS.termsAndPrivacy}
        </ConsentCheckbox>
        <ConsentCheckbox name="consentData" errors={state.fieldErrors?.consentData}>
          {CONSENT_STATEMENTS.childProfileData}
        </ConsentCheckbox>

        <div className="rounded-2xl bg-white p-4">
          <ConsentCheckbox name="showOnLeaderboard">
            <span className="font-bold">Optional.</span> {CONSENT_STATEMENTS.leaderboardDisplay}{" "}
            <span className="text-ink-500">
              Leave this unticked to keep the profile private. You can change it later.
            </span>
          </ConsentCheckbox>
        </div>

        <Alert variant="info">
          <Info aria-hidden="true" />
          <AlertTitle>About these tick boxes</AlertTitle>
          <AlertDescription>{CONSENT_LIMITATION_NOTICE}</AlertDescription>
        </Alert>
      </section>

      <div>
        <SubmitButton size="lg" variant="playful" pendingLabel="Creating profile…">
          Create explorer profile
        </SubmitButton>
      </div>
    </form>
  )
}
