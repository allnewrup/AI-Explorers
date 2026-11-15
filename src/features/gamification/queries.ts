import "server-only"

import { cache } from "react"
import { COLUMNS } from "@/lib/db-columns"
import { createClient } from "@/lib/supabase/server"
import { parseRpc } from "@/lib/validation/rpc"
import type { Enums } from "@/types/database"
import {
  childSummarySchema,
  dailyChallengeSchema,
  leaderboardSchema,
  type ChildSummary,
  type DailyChallenge,
  type Leaderboard,
} from "./schemas"

function fail(what: string, code: string | null | undefined): never {
  throw new Error(`Could not load ${what} (${code ?? "unknown"}).`)
}

/** Headline numbers for one child, computed in the database from stored rows. */
export const getChildSummary = cache(async (childId: string): Promise<ChildSummary> => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_child_summary", { p_child_id: childId })
  if (error) fail("the progress summary", error.code)
  return parseRpc(childSummarySchema, data, "get_child_summary")
})

export async function getWeeklyLeaderboard(childId: string, limit = 10): Promise<Leaderboard> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_weekly_leaderboard", {
    p_child_id: childId,
    p_limit: limit,
  })
  if (error) fail("the leaderboard", error.code)
  return parseRpc(leaderboardSchema, data, "get_weekly_leaderboard")
}

export async function getDailyChallenge(childId: string): Promise<DailyChallenge> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_daily_challenge", { p_child_id: childId })
  if (error) fail("the daily challenge", error.code)
  return parseRpc(dailyChallengeSchema, data, "get_daily_challenge")
}

export type AchievementStatus = {
  id: string
  title: string
  description: string
  badgeKey: string
  pointsThreshold: number
  earnedAt: string | null
}

/** Every active achievement, marked with when (if ever) this child earned it. */
export async function listAchievements(childId: string): Promise<AchievementStatus[]> {
  const supabase = await createClient()
  const [achievements, earned] = await Promise.all([
    supabase
      .from("achievements")
      .select(COLUMNS.achievements)
      .eq("is_active", true)
      .order("points_threshold", { ascending: true }),
    supabase
      .from("child_achievements")
      .select(COLUMNS.child_achievements)
      .eq("child_profile_id", childId),
  ])
  if (achievements.error) fail("achievements", achievements.error.code)
  if (earned.error) fail("earned achievements", earned.error.code)

  const earnedAt = new Map(earned.data.map((row) => [row.achievement_id, row.earned_at]))
  return achievements.data.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    badgeKey: row.badge_key,
    pointsThreshold: row.points_threshold,
    earnedAt: earnedAt.get(row.id) ?? null,
  }))
}

export type XpTransaction = {
  id: string
  eventType: Enums<"points_event_type">
  points: number
  createdAt: string
}

/** The most recent XP transactions, straight from the ledger. */
export async function listXpTransactions(childId: string, limit = 20): Promise<XpTransaction[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("points_ledger")
    .select(COLUMNS.points_ledger)
    .eq("child_profile_id", childId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) fail("XP history", error.code)
  return data.map((row) => ({
    id: row.id,
    eventType: row.event_type,
    points: row.points,
    createdAt: row.created_at,
  }))
}
