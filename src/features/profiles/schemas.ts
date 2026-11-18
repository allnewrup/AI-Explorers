import { z } from "zod"
import { AGE_BANDS } from "@/config/age-bands"
import { AVATAR_KEYS } from "@/config/avatars"
import { EXPLORER_NAME_RULES, isValidExplorerName } from "@/config/explorer-names"

const displayName = z
  .string()
  .trim()
  .min(1, "Please choose or type an explorer name.")
  .refine(isValidExplorerName, EXPLORER_NAME_RULES)

const avatarKey = z.enum(AVATAR_KEYS, "Please choose an avatar.")
const ageBand = z.enum(AGE_BANDS, "Please choose an age band.")

export const createChildSchema = z.object({
  displayName,
  avatarKey,
  ageBand,
  showOnLeaderboard: z.boolean(),
  consentTerms: z.literal(true, "Please confirm that you are this child's parent or guardian."),
  consentData: z.literal(true, "We need your agreement to store this profile."),
})

export const updateChildSchema = z.object({
  childId: z.uuid(),
  displayName,
  avatarKey,
  ageBand,
})

export const childIdSchema = z.object({ childId: z.uuid() })

export type CreateChildInput = z.infer<typeof createChildSchema>
