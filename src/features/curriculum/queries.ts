import "server-only"

import { cache } from "react"
import type { AgeBand } from "@/config/age-bands"
import {
  progressStateOf,
  summariseWorldProgress,
  type PathLesson,
} from "@/features/lessons/learning-path"
import { COLUMNS } from "@/lib/db-columns"
import { createClient } from "@/lib/supabase/server"

export type World = {
  id: string
  title: string
  slug: string
  description: string
  imageKey: string
  ageBand: AgeBand
  displayOrder: number
}

export type WorldWithProgress = World & {
  lessonCount: number
  completedCount: number
}

function fail(what: string, code: string | null | undefined): never {
  throw new Error(`Could not load ${what} (${code ?? "unknown"}).`)
}

/**
 * Active worlds, in order.
 *
 * `is_active` is filtered explicitly even though row-level security already
 * hides inactive worlds from parents: administrators can see everything, and
 * the child area must look the same for them as it does for families.
 */
export const listActiveWorlds = cache(async (): Promise<World[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("learning_worlds")
    .select(COLUMNS.learning_worlds)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) fail("learning worlds", error.code)

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    imageKey: row.image_key,
    ageBand: row.age_band,
    displayOrder: row.display_order,
  }))
})

/**
 * Every published lesson in curriculum order, annotated with one child's
 * progress. This is the single read that the dashboard, the learn page and the
 * world pages are all derived from.
 */
export const getLearningPath = cache(async (childId: string): Promise<PathLesson[]> => {
  const supabase = await createClient()
  const worlds = await listActiveWorlds()
  if (worlds.length === 0) return []

  const [lessonsResult, progressResult] = await Promise.all([
    supabase
      .from("lessons")
      .select(COLUMNS.lessons_summary)
      .eq("status", "published")
      .in(
        "learning_world_id",
        worlds.map((world) => world.id)
      )
      .order("display_order", { ascending: true }),
    supabase.from("lesson_progress").select(COLUMNS.lesson_progress).eq("child_profile_id", childId),
  ])

  if (lessonsResult.error) fail("lessons", lessonsResult.error.code)
  if (progressResult.error) fail("lesson progress", progressResult.error.code)

  const progressByLesson = new Map(progressResult.data.map((row) => [row.lesson_id, row]))
  const worldOrder = new Map(worlds.map((world, index) => [world.id, { world, index }]))

  return lessonsResult.data
    .flatMap((row) => {
      const entry = worldOrder.get(row.learning_world_id)
      if (!entry) return []
      const progress = progressByLesson.get(row.id)
      const lesson: PathLesson = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        estimatedMinutes: row.estimated_minutes,
        isSample: row.is_sample,
        hasVideo: row.video_asset_key !== null,
        worldId: entry.world.id,
        worldTitle: entry.world.title,
        worldSlug: entry.world.slug,
        worldImageKey: entry.world.imageKey,
        progress: progressStateOf(progress),
        lastActivityAt: progress?.updated_at ?? null,
      }
      return [{ lesson, worldIndex: entry.index, order: row.display_order }]
    })
    .sort(
      (a, b) =>
        a.worldIndex - b.worldIndex ||
        a.order - b.order ||
        a.lesson.title.localeCompare(b.lesson.title)
    )
    .map((item) => item.lesson)
})

export async function listWorldsWithProgress(childId: string): Promise<WorldWithProgress[]> {
  const [worlds, path] = await Promise.all([listActiveWorlds(), getLearningPath(childId)])
  const progress = summariseWorldProgress(path)
  return worlds.map((world) => ({
    ...world,
    lessonCount: progress.get(world.id)?.total ?? 0,
    completedCount: progress.get(world.id)?.completed ?? 0,
  }))
}

export async function getActiveWorldBySlug(slug: string): Promise<World | null> {
  return (await listActiveWorlds()).find((world) => world.slug === slug) ?? null
}
