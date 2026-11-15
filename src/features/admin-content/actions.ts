"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { routes } from "@/config/site"
import {
  fail,
  fieldErrorsOf,
  formChecked,
  formError,
  formText,
  ok,
  type ActionResult,
  type FormState,
} from "@/lib/action-result"
import { getProfile } from "@/lib/auth/session"
import { describeDbError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"
import { LESSON_STATUSES, lessonInputSchema, worldInputSchema } from "./schemas"

const NOT_ADMIN = "Only administrators can do that."

/**
 * Admin check for actions. Server Actions are public HTTP endpoints, so each
 * one authorises itself rather than relying on the page that rendered the
 * form. The role is read from the database, and the database functions below
 * check it once more.
 */
async function isAdmin(): Promise<boolean> {
  const profile = await getProfile()
  return profile?.role === "admin"
}

function issuesToFieldErrors(error: z.ZodError): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form"
    ;(result[key] ??= []).push(issue.message)
  }
  return result
}

/** Creates (no id) or updates a lesson and its quiz, as a draft-preserving save. */
export async function saveLessonAction(
  lessonId: string | null,
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  if (!(await isAdmin())) return fail(NOT_ADMIN)

  if (lessonId !== null && !z.uuid().safeParse(lessonId).success) {
    return fail("That lesson could not be found.")
  }

  const parsed = lessonInputSchema.safeParse(input)
  if (!parsed.success) {
    return fail("Please fix the highlighted fields before saving.", issuesToFieldErrors(parsed.error))
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_upsert_lesson", {
    p_payload: parsed.data as unknown as Json,
    ...(lessonId ? { p_lesson_id: lessonId } : {}),
  })

  if (error || !data) {
    if (error?.code === "23505") {
      return fail("That URL name is already used by another lesson.", {
        slug: ["Choose a different URL name."],
      })
    }
    return fail(describeDbError(error))
  }

  revalidatePath("/", "layout")
  return ok({ id: data })
}

/** Publishes, unpublishes or archives a lesson. The database validates publishing. */
export async function setLessonStatusAction(
  lessonId: string,
  status: string
): Promise<ActionResult> {
  if (!(await isAdmin())) return fail(NOT_ADMIN)

  const parsed = z
    .object({ lessonId: z.uuid(), status: z.enum(LESSON_STATUSES) })
    .safeParse({ lessonId, status })
  if (!parsed.success) return fail("That change could not be applied.")

  const supabase = await createClient()
  const { error } = await supabase.rpc("admin_set_lesson_status", {
    p_lesson_id: parsed.data.lessonId,
    p_status: parsed.data.status,
  })
  if (error) return fail(describeDbError(error))

  revalidatePath("/", "layout")
  return ok(undefined)
}

/** Creates or updates a learning world (category). */
export async function saveWorldAction(_previous: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAdmin())) return formError(NOT_ADMIN)

  const values = {
    title: formText(formData, "title"),
    slug: formText(formData, "slug"),
    description: formText(formData, "description"),
    image_key: formText(formData, "image_key"),
    age_band: formText(formData, "age_band"),
    display_order: formText(formData, "display_order"),
  }
  const id = formText(formData, "id")
  const parsed = worldInputSchema.safeParse({
    ...values,
    ...(id ? { id } : {}),
    display_order: Number(values.display_order || "0"),
    is_active: formChecked(formData, "is_active"),
  })
  if (!parsed.success) {
    return formError("Please check the highlighted fields.", {
      fieldErrors: fieldErrorsOf(parsed.error),
      values,
    })
  }

  const { id: worldId, ...fields } = parsed.data
  const supabase = await createClient()
  const result = worldId
    ? await supabase.from("learning_worlds").update(fields).eq("id", worldId).select("id")
    : await supabase.from("learning_worlds").insert(fields).select("id")

  if (result.error) {
    if (result.error.code === "23505") {
      return formError("That URL name is already used by another world.", {
        fieldErrors: { slug: ["Choose a different URL name."] },
        values,
      })
    }
    return formError(describeDbError(result.error), { values })
  }
  if (result.data.length === 0) return formError("That world could not be found.", { values })

  revalidatePath("/", "layout")
  revalidatePath(routes.admin.worlds)
  return { status: "success", message: worldId ? "World updated." : "World created." }
}
