import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import type { AgeBand } from "@/config/age-bands"
import { isSupabaseConfigured } from "@/config/env"
import { routes } from "@/config/site"
import { ACTIVE_CHILD_COOKIE } from "@/lib/auth/constants"
import { COLUMNS } from "@/lib/db-columns"
import { createClient } from "@/lib/supabase/server"

/**
 * Data Access Layer for identity.
 *
 * Every function here is the server asking Supabase who the caller is. Nothing
 * is taken from the browser on trust: not the user id, not the role, and not
 * the active child. Results are memoised per request with React `cache`.
 */

export type SessionUser = {
  id: string
  email: string | null
}

export type Profile = {
  id: string
  role: "parent" | "admin"
  displayName: string
  email: string | null
}

export type ChildProfile = {
  id: string
  displayName: string
  avatarKey: string
  ageBand: AgeBand
  showOnLeaderboard: boolean
  isActive: boolean
  createdAt: string
}

/** The signed-in user, verified with the Supabase Auth server. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return { id: data.user.id, email: data.user.email ?? null }
})

/**
 * The caller's profile row. `role` comes from the database, where it cannot be
 * edited through the API.
 */
export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getSessionUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(COLUMNS.profiles)
    .eq("id", user.id)
    .maybeSingle()

  if (error) throw new Error(`Could not load your profile (${error.code ?? "unknown"}).`)
  if (!data) {
    // A signed-in user always has a profile (created by a database trigger).
    // Redirecting here would loop with the proxy, so fail loudly instead.
    throw new Error("Your account has no profile row. Has the database migration been applied?")
  }

  return { id: data.id, role: data.role, displayName: data.display_name, email: user.email }
})

/** For pages and actions that need any signed-in adult. */
export async function requireProfile(): Promise<Profile> {
  const profile = await getProfile()
  if (!profile) redirect(routes.login)
  return profile
}

/**
 * For the admin area. Non-administrators get a 404 rather than a "forbidden"
 * page, so the admin area's existence is not advertised.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireProfile()
  if (profile.role !== "admin") notFound()
  return profile
}

/** The signed-in parent's children. Row-level security returns only their own. */
export const listChildProfiles = cache(async (): Promise<ChildProfile[]> => {
  const profile = await getProfile()
  if (!profile) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("child_profiles")
    .select(COLUMNS.child_profiles)
    .order("created_at", { ascending: true })

  if (error) throw new Error(`Could not load explorer profiles (${error.code ?? "unknown"}).`)

  return data.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    avatarKey: row.avatar_key,
    ageBand: row.age_band,
    showOnLeaderboard: row.show_on_leaderboard,
    isActive: row.is_active,
    createdAt: row.created_at,
  }))
})

/**
 * The child profile in use. The cookie only chooses between children that the
 * database has already confirmed belong to this parent.
 */
export const getActiveChild = cache(async (): Promise<ChildProfile | null> => {
  const children = (await listChildProfiles()).filter((child) => child.isActive)
  if (children.length === 0) return null

  const selected = (await cookies()).get(ACTIVE_CHILD_COOKIE)?.value
  return children.find((child) => child.id === selected) ?? children[0] ?? null
})

/** For the child area. Sends parents without an active child to set one up. */
export async function requireActiveChild(): Promise<ChildProfile> {
  await requireProfile()
  const child = await getActiveChild()
  if (!child) {
    const all = await listChildProfiles()
    redirect(all.length > 0 ? routes.parent.children : routes.onboarding)
  }
  return child
}
