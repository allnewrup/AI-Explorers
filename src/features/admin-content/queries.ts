import "server-only"

import type { AgeBand } from "@/config/age-bands"
import { COLUMNS } from "@/lib/db-columns"
import { domainErrorCode } from "@/lib/errors"
import { createClient } from "@/lib/supabase/server"
import { parseRpc } from "@/lib/validation/rpc"
import type { Enums } from "@/types/database"
import {
  adminLessonSchema,
  contentOverviewSchema,
  type AdminLesson,
  type ContentOverview,
} from "./schemas"

/**
 * Admin read models. Each page that calls these has already passed
 * requireAdmin(); the database enforces the same rule again (admin_* functions
 * raise for non-admins, and row-level security only shows drafts to admins).
 */

export type AdminWorld = {
  id: string
  title: string
  slug: string
  description: string
  imageKey: string
  ageBand: AgeBand
  displayOrder: number
  isActive: boolean
}

export type AdminLessonRow = {
  id: string
  title: string
  slug: string
  worldId: string
  worldTitle: string
  ageBand: AgeBand
  status: Enums<"lesson_status">
  isSample: boolean
  hasVideo: boolean
  displayOrder: number
  updatedAt: string
}

export async function getContentOverview(): Promise<ContentOverview> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_content_overview")
  if (error) throw new Error(`Could not load the content overview (${error.code ?? "unknown"}).`)
  return parseRpc(contentOverviewSchema, data, "admin_content_overview")
}

/** All worlds, including inactive ones. */
export async function listWorldsForAdmin(): Promise<AdminWorld[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("learning_worlds")
    .select(COLUMNS.learning_worlds)
    .order("display_order", { ascending: true })

  if (error) throw new Error(`Could not load learning worlds (${error.code ?? "unknown"}).`)
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    imageKey: row.image_key,
    ageBand: row.age_band,
    displayOrder: row.display_order,
    isActive: row.is_active,
  }))
}

/** All lessons in every status. */
export async function listLessonsForAdmin(): Promise<AdminLessonRow[]> {
  const supabase = await createClient()
  const [lessons, worlds] = await Promise.all([
    supabase.from("lessons").select(COLUMNS.lessons_summary).order("display_order", { ascending: true }),
    listWorldsForAdmin(),
  ])
  if (lessons.error) throw new Error(`Could not load lessons (${lessons.error.code ?? "unknown"}).`)

  const worldById = new Map(worlds.map((world, index) => [world.id, { world, index }]))
  return lessons.data
    .map((row) => {
      const entry = worldById.get(row.learning_world_id)
      const lesson: AdminLessonRow = {
        id: row.id,
        title: row.title,
        slug: row.slug,
        worldId: row.learning_world_id,
        worldTitle: entry?.world.title ?? "Unknown world",
        ageBand: row.age_band,
        status: row.status,
        isSample: row.is_sample,
        hasVideo: row.video_asset_key !== null,
        displayOrder: row.display_order,
        updatedAt: row.updated_at,
      }
      return { lesson, worldIndex: entry?.index ?? Number.MAX_SAFE_INTEGER }
    })
    .sort((a, b) => a.worldIndex - b.worldIndex || a.lesson.displayOrder - b.lesson.displayOrder)
    .map((item) => item.lesson)
}

/** The full lesson document for the editor and the preview. */
export async function getLessonForAdmin(lessonId: string): Promise<AdminLesson | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_get_lesson", { p_lesson_id: lessonId })
  if (error) {
    if (domainErrorCode(error) === "aie:lesson_not_found" || error.code === "22P02") return null
    throw new Error(`Could not load the lesson (${error.code ?? "unknown"}).`)
  }
  return parseRpc(adminLessonSchema, data, "admin_get_lesson")
}
