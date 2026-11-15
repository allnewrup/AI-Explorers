/**
 * Pure helpers that decide what a child should see next. No database access,
 * so they are easy to unit-test.
 */

export type ProgressState = "not_started" | "in_progress" | "completed"

export type PathLesson = {
  id: string
  slug: string
  title: string
  description: string
  estimatedMinutes: number
  isSample: boolean
  hasVideo: boolean
  worldId: string
  worldTitle: string
  worldSlug: string
  worldImageKey: string
  progress: ProgressState
  /** ISO timestamp of the child's last activity on this lesson, if any. */
  lastActivityAt: string | null
}

export function progressStateOf(
  progress: { lesson_completed: boolean } | null | undefined
): ProgressState {
  if (!progress) return "not_started"
  return progress.lesson_completed ? "completed" : "in_progress"
}

/**
 * "Today's lesson": the first lesson in curriculum order that is not finished.
 * Returns null when everything is complete (or nothing is published).
 */
export function pickNextLesson(path: readonly PathLesson[]): PathLesson | null {
  return path.find((lesson) => lesson.progress !== "completed") ?? null
}

/**
 * "Continue learning": the lesson the child most recently opened but has not
 * finished. Returns null if there is no lesson in progress, or if it is the
 * same lesson that is already shown as today's lesson.
 */
export function pickContinueLesson(
  path: readonly PathLesson[],
  todaysLesson: PathLesson | null
): PathLesson | null {
  const inProgress = path
    .filter((lesson) => lesson.progress === "in_progress" && lesson.lastActivityAt)
    .sort((a, b) => (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""))

  const candidate = inProgress[0] ?? null
  if (!candidate || candidate.id === todaysLesson?.id) return null
  return candidate
}

export type WorldProgress = {
  worldId: string
  completed: number
  total: number
}

export function summariseWorldProgress(path: readonly PathLesson[]): Map<string, WorldProgress> {
  const result = new Map<string, WorldProgress>()
  for (const lesson of path) {
    const entry = result.get(lesson.worldId) ?? { worldId: lesson.worldId, completed: 0, total: 0 }
    entry.total += 1
    if (lesson.progress === "completed") entry.completed += 1
    result.set(lesson.worldId, entry)
  }
  return result
}
