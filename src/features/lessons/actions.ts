"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { fail, ok, type ActionResult } from "@/lib/action-result"
import { getActiveChild } from "@/lib/auth/session"
import { describeDbError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import { parseRpc } from "@/lib/validation/rpc"
import { lessonCompletionSchema, type LessonCompletion } from "./schemas"

const lessonIdSchema = z.uuid()
const NO_CHILD = "Choose an explorer profile first."

/**
 * Records that the active child opened a lesson (and optionally finished its
 * video). The child is always resolved on the server from the session; the
 * browser only says which lesson.
 */
export async function recordLessonProgressAction(
  lessonId: string,
  videoCompleted = false
): Promise<ActionResult> {
  const parsed = lessonIdSchema.safeParse(lessonId)
  if (!parsed.success) return fail("That lesson could not be found.")

  const child = await getActiveChild()
  if (!child) return fail(NO_CHILD)

  const supabase = await createClient()
  const { error } = await supabase.rpc("record_lesson_progress", {
    p_child_id: child.id,
    p_lesson_id: parsed.data,
    p_video_completed: videoCompleted === true,
  })
  if (error) return fail(describeDbError(error))

  return ok(undefined)
}

/** Marks a lesson complete. XP is awarded by the database, at most once. */
export async function completeLessonAction(
  lessonId: string
): Promise<ActionResult<LessonCompletion>> {
  const parsed = lessonIdSchema.safeParse(lessonId)
  if (!parsed.success) return fail("That lesson could not be found.")

  const child = await getActiveChild()
  if (!child) return fail(NO_CHILD)

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("complete_lesson", {
    p_child_id: child.id,
    p_lesson_id: parsed.data,
  })
  if (error) return fail(describeDbError(error))

  revalidatePath("/", "layout")
  return ok(parseRpc(lessonCompletionSchema, data, "complete_lesson"))
}
