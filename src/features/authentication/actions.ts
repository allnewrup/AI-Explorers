"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getSiteUrl, isSupabaseConfigured } from "@/config/env"
import { routes } from "@/config/site"
import {
  fieldErrorsOf,
  formChecked,
  formError,
  formText,
  type FormState,
} from "@/lib/action-result"
import { ACTIVE_CHILD_COOKIE, NOT_CONFIGURED_MESSAGE } from "@/lib/auth/constants"
import { safeNextPath } from "@/lib/auth/paths"
import { describeAuthError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import {
  passwordResetRequestSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "./schemas"

const CHECK_FIELDS = "Please check the highlighted fields."

/** Raw password as typed. Deliberately not trimmed and never echoed back. */
function formPassword(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}

export async function signUpAction(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return formError(NOT_CONFIGURED_MESSAGE)

  const values = {
    displayName: formText(formData, "displayName"),
    email: formText(formData, "email"),
  }
  const parsed = signUpSchema.safeParse({
    ...values,
    password: formPassword(formData, "password"),
    acceptTerms: formChecked(formData, "acceptTerms"),
  })
  if (!parsed.success) {
    return formError(CHECK_FIELDS, { fieldErrors: fieldErrorsOf(parsed.error), values })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Only a display name is sent. Any role placed here would be ignored:
      // the database trigger always creates new accounts as "parent".
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(routes.onboarding)}`,
    },
  })

  if (error) return formError(describeAuthError(error), { values })

  // Email confirmation switched off in the Supabase project: signed in already.
  if (data.session) redirect(routes.onboarding)

  // Same message whether or not the address was already registered, so the
  // form cannot be used to discover who has an account.
  return {
    status: "success",
    message:
      "Almost there! We have sent a confirmation link to your email address. Open it to finish creating your account.",
  }
}

export async function signInAction(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return formError(NOT_CONFIGURED_MESSAGE)

  const values = { email: formText(formData, "email") }
  const parsed = signInSchema.safeParse({
    ...values,
    password: formPassword(formData, "password"),
  })
  if (!parsed.success) {
    return formError(CHECK_FIELDS, { fieldErrors: fieldErrorsOf(parsed.error), values })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return formError(describeAuthError(error), { values })

  redirect(safeNextPath(formData.get("next")))
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  ;(await cookies()).delete(ACTIVE_CHILD_COOKIE)
  redirect(routes.home)
}

export async function requestPasswordResetAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isSupabaseConfigured()) return formError(NOT_CONFIGURED_MESSAGE)

  const values = { email: formText(formData, "email") }
  const parsed = passwordResetRequestSchema.safeParse(values)
  if (!parsed.success) {
    return formError(CHECK_FIELDS, { fieldErrors: fieldErrorsOf(parsed.error), values })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(routes.resetPassword)}`,
  })

  // Rate limiting is worth telling the user about; anything else is reported
  // identically so the form does not reveal which addresses are registered.
  if (error && (error.code ?? "").includes("rate_limit")) {
    return formError(describeAuthError(error), { values })
  }

  return {
    status: "success",
    message:
      "If an account exists for that address, we have sent a link to reset the password. It may take a minute to arrive.",
  }
}

export async function updatePasswordAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  if (!isSupabaseConfigured()) return formError(NOT_CONFIGURED_MESSAGE)

  const parsed = updatePasswordSchema.safeParse({
    password: formPassword(formData, "password"),
    confirmPassword: formPassword(formData, "confirmPassword"),
  })
  if (!parsed.success) {
    return formError(CHECK_FIELDS, { fieldErrors: fieldErrorsOf(parsed.error) })
  }

  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return formError("This reset link has expired. Please request a new one.")
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) return formError(describeAuthError(error))

  redirect(routes.parent.dashboard)
}
