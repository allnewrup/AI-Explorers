"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { fail, ok, type ActionResult } from "@/lib/action-result"
import { getActiveChild } from "@/lib/auth/session"
import { describeDbError } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import { parseRpc } from "@/lib/validation/rpc"
import { dailyChallengeSubmissionSchema, type DailyChallengeSubmission } from "./schemas"

/**
 * Answers today's challenge for the active child. The database decides which
 * question is today's, whether the answer is right, and whether the reward
 * has already been given.
 */
export async function submitDailyChallengeAction(
  optionId: string
): Promise<ActionResult<DailyChallengeSubmission>> {
  const parsed = z.uuid().safeParse(optionId)
  if (!parsed.success) return fail("That answer could not be read. Please try again.")

  const child = await getActiveChild()
  if (!child) return fail("Choose an explorer profile first.")

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("submit_daily_challenge", {
    p_child_id: child.id,
    p_option_id: parsed.data,
  })
  if (error) return fail(describeDbError(error))

  revalidatePath("/", "layout")
  return ok(parseRpc(dailyChallengeSubmissionSchema, data, "submit_daily_challenge"))
}
