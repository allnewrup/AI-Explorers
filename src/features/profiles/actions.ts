"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { POLICY_VERSION } from "@/config/policy"
import { routes } from "@/config/site"
import {
  fieldErrorsOf,
  formChecked,
  formError,
  formText,
  type FormState,
} from "@/lib/action-result"
import { ACTIVE_CHILD_COOKIE, ACTIVE_CHILD_COOKIE_MAX_AGE } from "@/lib/auth/constants"
import { getProfile, listChildProfiles } from "@/lib/auth/session"
import { describeDbError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import { childIdSchema, createChildSchema, updateChildSchema } from "./schemas"

const SIGN_IN_AGAIN = "Your session has ended. Please sign in again."
const CHECK_FIELDS = "Please check the highlighted fields."

async function rememberActiveChild(childId: string) {
  ;(await cookies()).set(ACTIVE_CHILD_COOKIE, childId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACTIVE_CHILD_COOKIE_MAX_AGE,
  })
}

/** Onboarding: creates a child profile and records the parent's consent. */
export async function createChildProfileAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const profile = await getProfile()
  if (!profile) return formError(SIGN_IN_AGAIN)

  const values = {
    displayName: formText(formData, "displayName"),
    avatarKey: formText(formData, "avatarKey"),
    ageBand: formText(formData, "ageBand"),
  }
  const parsed = createChildSchema.safeParse({
    ...values,
    showOnLeaderboard: formChecked(formData, "showOnLeaderboard"),
    consentTerms: formChecked(formData, "consentTerms"),
    consentData: formChecked(formData, "consentData"),
  })
  if (!parsed.success) {
    return formError(CHECK_FIELDS, { fieldErrors: fieldErrorsOf(parsed.error), values })
  }

  const supabase = await createClient()
  // The parent is taken from the session inside the database function; no
  // parent id is sent, so a profile cannot be created for someone else.
  const { data: childId, error } = await supabase.rpc("create_child_profile", {
    p_display_name: parsed.data.displayName,
    p_avatar_key: parsed.data.avatarKey,
    p_age_band: parsed.data.ageBand,
    p_show_on_leaderboard: parsed.data.showOnLeaderboard,
    p_policy_version: POLICY_VERSION,
  })
  if (error || !childId) return formError(describeDbError(error), { values })

  await rememberActiveChild(childId)
  revalidatePath("/", "layout")
  redirect(routes.child.dashboard)
}

/** Switches which of the parent's own children is learning. */
export async function selectActiveChildAction(formData: FormData): Promise<void> {
  const parsed = childIdSchema.safeParse({ childId: formText(formData, "childId") })
  if (!parsed.success) redirect(routes.parent.dashboard)

  // listChildProfiles() is filtered by row-level security, so this lookup is
  // the authorisation check: an id that is not this parent's child is ignored.
  const child = (await listChildProfiles()).find((item) => item.id === parsed.data.childId)
  if (!child || !child.isActive) redirect(routes.parent.children)

  await rememberActiveChild(child.id)
  revalidatePath("/", "layout")
  redirect(routes.child.dashboard)
}

export async function updateChildProfileAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const profile = await getProfile()
  if (!profile) return formError(SIGN_IN_AGAIN)

  const values = {
    displayName: formText(formData, "displayName"),
    avatarKey: formText(formData, "avatarKey"),
    ageBand: formText(formData, "ageBand"),
  }
  const parsed = updateChildSchema.safeParse({ childId: formText(formData, "childId"), ...values })
  if (!parsed.success) {
    return formError(CHECK_FIELDS, { fieldErrors: fieldErrorsOf(parsed.error), values })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("child_profiles")
    .update({
      display_name: parsed.data.displayName,
      avatar_key: parsed.data.avatarKey,
      age_band: parsed.data.ageBand,
    })
    .eq("id", parsed.data.childId)
    .select("id")

  if (error) return formError(describeDbError(error), { values })
  if (data.length === 0) return formError("We could not find that explorer profile.", { values })

  revalidatePath("/", "layout")
  return { status: "success", message: "Profile updated." }
}

/** Pauses or resumes a profile. A paused profile keeps its history. */
export async function setChildActiveAction(formData: FormData): Promise<void> {
  const parsed = childIdSchema.safeParse({ childId: formText(formData, "childId") })
  const profile = await getProfile()
  if (!parsed.success || !profile) return

  const supabase = await createClient()
  await supabase
    .from("child_profiles")
    .update({ is_active: formChecked(formData, "active") })
    .eq("id", parsed.data.childId)

  revalidatePath("/", "layout")
}

export async function setLeaderboardVisibilityAction(formData: FormData): Promise<void> {
  const parsed = childIdSchema.safeParse({ childId: formText(formData, "childId") })
  const profile = await getProfile()
  if (!parsed.success || !profile) return

  const supabase = await createClient()
  await supabase.rpc("set_leaderboard_visibility", {
    p_child_id: parsed.data.childId,
    p_visible: formChecked(formData, "visible"),
    p_policy_version: POLICY_VERSION,
  })

  revalidatePath("/", "layout")
}

/** Permanently deletes a child profile and all of its learning records. */
export async function deleteChildProfileAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const profile = await getProfile()
  if (!profile) return formError(SIGN_IN_AGAIN)

  const parsed = childIdSchema.safeParse({ childId: formText(formData, "childId") })
  if (!parsed.success) return formError("We could not find that explorer profile.")
  if (formText(formData, "confirmation") !== "DELETE") {
    return formError("Type DELETE to confirm.", {
      fieldErrors: { confirmation: ["Type DELETE in capital letters to confirm."] },
    })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("child_profiles")
    .delete()
    .eq("id", parsed.data.childId)
    .select("id")

  if (error) return formError(describeDbError(error))
  if (data.length === 0) return formError("We could not find that explorer profile.")

  revalidatePath("/", "layout")
  return { status: "success", message: "The profile and its learning records were deleted." }
}
